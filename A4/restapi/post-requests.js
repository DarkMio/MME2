"use strict";
const router = require('express').Router();

/**
 * @param filters Filter criteria
 * @param item the item that the filter should be applied on
 * @param next The next handler in case there are some errors.
 **/
const filter = (filters, item, next) => {
    if (!filters.every((value) => { return item[value] && item[value] !== 'undefined'; })) { // item[value] && item[value] !== 'undefined'})){
        const err = new Error("There is no fucking filter for that.");
        err.status = 400;
        next(err);
        return false;
    }
    Object.keys(item).forEach((value) => {
        if(filters.indexOf(value) === -1) {
            delete item[value];
        }
    });
    return item;
};

const moreThanExclusions = (query) => {
    const exclusionKeywords = ['filter', 'limit', 'offset'];
    const keys = Object.keys(query);
    if(keys.length > 3) {
        return true;
    }
    // is anything else in the query than filter/limit?
    return !keys.every((value) => { return exclusionKeywords.indexOf(value) > -1; });
};

const collectNonExclusions = (query) => {
    const collector = {};
    const exclusionKeywords = ['filter', 'limit', 'offset'];
    Object.keys(query).forEach((value) => {
        if (exclusionKeywords.indexOf(value) < 0) {
            collector[value] = query[value];
        }
    });
    return collector;
};

/**
 * A router that works through a rest-response answer and does things like
 * filtering, searching and so on.
 * Theoretically it should work on all responses, no matter how big or small
 * the response is.
 * To produce stable results, we:
 *  1. search through the dataset and delete all unfitting entries
 *  2. filter out the result set (interchangeable with 1.)
 *  3. apply limit and offset of the remaining data
 *  4. sending out the remaining data
 **/
router.use(function(req, res, next){
    if(!res.locals.items) {
        if(moreThanExclusions(req.query)) {
            const err = new Error("Result is empty and not searchable");
            err.status = 400;
            next(err);
            return;
        }
        if(req.query['filter']) {
            const err = new Error("Result is empty and not filterable");
            err.status = 400;
            next(err);
            return;
        }
        if(req.query['limit']) {
            const err = new Error("Result is empty and not pageable");
            err.status = 400;
            next(err);
            return;
        }
    }
    // matching search criteria (for arrays only)
    if(Array.isArray(res.locals.items) && moreThanExclusions(req.query)) {
        const testValue = res.locals.items[0];
        const testKeys = Object.keys(testValue);
        const searchValues = collectNonExclusions(req.query);
        const searchKeys = Object.keys(searchValues);
        // do we have search criteria that isn't in the object?
        if(!searchKeys.every((value) => { return testKeys.indexOf(value) >= 0; })) {
            const err = new Error("1 or more search criteria is not applicable for this type");
            err.status = 400;
            next(err);
            return;
        }

        // for each array entry...
        const collector = [];
        res.locals.items.forEach((entry, index, array) => {
            // value = {"...": "..."}
            // for each search key...const collector = [];
            for(let i = 0; i < searchKeys.length; i++) {
                const searchKey = searchKeys[i];
                // look up if it matches search criteria
                if(entry[searchKey].toLowerCase().indexOf(req.query[searchKey].toLowerCase()) >= 0) {
                    // if not, throw it away and go to the next one
                    // res.locals.items.splice(index, 1);
                    collector.push(entry);
                }
            }
            res.locals.items = collector || null;
        })
    }
    next();
});

router.use(function(req, res, next) {
    if(req.query['filter']) {
        // ex: "title,src,length"
        const filters = req.query['filter'].split(',');
        if (Array.isArray(res.locals.items)) {
            if(filter(filters, res.locals.items[0], next) == false) {
                return;
            }
            res.locals.items.forEach((value, number, array) => {
                array[number] = filter(filters, value, next)
            })
        } else {
            if(filter(filters, res.locals.items, next) == false) {
                return;
            }
            res.locals.items = filter(filters, res.locals.items, next);
        }
    }
    next();
});

router.use(function(req, res, next) {
    if((req.query['limit'] || req.query['offset']) && Array.isArray(res.locals.items)) {
        const setLimit = !!req.query['limit'];
        let limit;
        if(req.query['limit']) {
            limit = parseInt(req.query['limit']) || -1;
        } else {
            limit = -1;
        }
        const offset = parseInt(req.query['offset']);
        if(limit <= 0 && setLimit) {
            const err = new Error("fucking Limit / Offset is weird of missing or idc");
            err.status = 400;
            next(err);
            return;
        }
        if(offset < 0) {
            const err = new Error("Bruh, offset and limit cannot be less than 0 or bogus");
            err.status = 400;
            next(err);
            return;
        }
        if(offset >= res.locals.items.length) {
            const err = new Error("Thats a bit far, matey. The result is shorter than your offset.");
            err.status = 400;
            next(err);
            return;
        }
        if(setLimit === false) {
            res.locals.items = res.locals.items.splice(offset);
        } else {
            res.locals.items = res.locals.items.splice(offset, limit);
        }

    }
    next();
});

router.use(function(req, res, next){


    if (res.locals.items) {
        // then we send it as json and remove it
        res.json(res.locals.items);
        delete res.locals.items;
    } else {
        // otherwise we set status to no-content
        res.set('Content-Type', 'application/json');
        // if someone forgot the status and response is empty set it to no content
        res.status(204).end();
    }
});

module.exports = router;