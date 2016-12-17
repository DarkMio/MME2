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

const errors = function(){
    const errorFactory = (msg, status) => {
        const x = new Error(msg);
        x.status = status;
        return x;
    };
    return {
        notSearchable: errorFactory("Result is empty and not searchable", 400),
        notFilterable: errorFactory("Result is empty and not filterable", 400),
        notPageable: errorFactory("Result is empty and not pageable", 400),
        notApplicableSearch: errorFactory("One or more search criteria is not applicable for this type", 400),
        wrongLimit: errorFactory("Limit cannot be less than zero or bogus", 400),
        wrongOffset: errorFactory("Offset cannot be less than zero or bogus", 400),
        offsetOverflow: errorFactory("Offset is higher than the result size", 400)
    }
}();

/**
 * First and foremost: Catch the obvious error cases - bundles what may end in boiler plate
 */
router.use((req, res, next) => {
    if(!res.locals.items) {
        if(moreThanExclusions(req.query)) {
            next(errors.notSearchable);
            return;
        }
        if(req.query['filter']) {
            next(errors.notFilterable);
            return;
        }
        if(req.query['limit']) {
            next(errors.notPageable);
            return;
        }
    }
    next();
});

/**
 * Now we handle the search first - this produces the final result-set and ensures that the client
 * can set limit and offset on that set - and gets rid of weird behaviour
 */
router.use(function(req, res, next){
    // matching search criteria (for arrays only)
    if(Array.isArray(res.locals.items) && moreThanExclusions(req.query)) {
        const testValue = res.locals.items[0];
        const testKeys = Object.keys(testValue);
        const searchValues = collectNonExclusions(req.query);
        const searchKeys = Object.keys(searchValues);
        // do we have search criteria that isn't in the object?
        if(!searchKeys.every((value) => { return testKeys.indexOf(value) >= 0; })) {
            next(errors.notApplicableSearch);
            return;
        }

        res.locals.items = res.locals.items.filter((entry, index) => {
            return searchKeys.every((key, number) => {
                const actual = (entry[key] + "").toLowerCase();
                const criteria = searchValues[key].toLowerCase();
                return actual.indexOf(criteria) >= 0;
            });
        });
    }
    next();
});

/**
 * Now we filter our result out by the given criteria.
 * This works for any object or array.
 */
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

/**
 * And lastly we do the limit and offset. this could be before filtering for performance (probably)
 */
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
            next(errors.wrongLimit);
            return;
        }
        if(offset < 0) {
            next(errors.wrongOffset);
            return;
        }
        if(offset >= res.locals.items.length) {
            next(errors.offsetOverflow);
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