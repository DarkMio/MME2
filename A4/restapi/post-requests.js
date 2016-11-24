var router = require('express').Router();

/**
 * @param filter Filter criteria
 * @param item the item that the filter should be applied on
 * @param next The next handler in case there are some errors.
 **/
var filter = (filters, item, next) => {
    if (!filters.every((value) => { return item[value] && item[value] !== 'undefined'})){ // Haha, you thought I would cross 80 characters limits
        var err = new Error("There is no fucking filter for that.");
        err.statusCode = 404;
        next(err);
        return;
    }
    Object.keys(item).forEach((value) => {
        if(filters.indexOf(value) === -1) {
            delete item[value];
        }
    });
    return item;
};

var moreThanExclusions = (query) => {
    var exclusionKeywords = ['filter', 'limit', 'offset'];
    var keys = Object.keys(query);
    if(keys.length > 3) {
        return;
    }
    
    var hasOtherKeys = false;
    // is anything else in the query than filter/limit?
    keys.forEach((value, index, array) => {
        if(exclusionKeywords.indexOf(value) >= 0) {
            hasOtherKeys = true;
        }
    })
    return hasOtherKeys;
};

var collectNonExclusions = (query) => {
    var collector = {};
    var exclusionKeywords = ['filter', 'limit', 'offset']
    Object.keys(query).forEach((value) => {
        if(exclusionKeywords.indexOf(value) >= 0) {
            collector[value] = query[value];
        }
    });
    return collector;
}

/**
 * A router that works through a rest-response answer and does things like
 * filtering, searching and so on.
 * Theoretically it should work on all responses, no matter how big or small
 * the response is.
 **/
router.use(function(req, res, next){
    // if anything to send has been added to res.locals.items
    if (res.locals.items) {
        // To produce stable results, we:
        // 1. search through the dataset and delete all unfitting entries
        // 2. filter out the result set (interchangeable with 1.)
        // 3. apply limit and offset of the remaining data
        // 4. sending out the remaining data
        
        // matching search criteria (for arrays only)
        if(Array.isArray(res.locals.items) && moreThanExclusions(req.query)) {
            var testValue = res.locals.items[0];
            var testKeys = Object.keys(testValue);
            var searchValues = collectNonExclusions(req.query);
            var searchKeys = Object.keys(searchValues);
            // do we have search criteria that isn't in the object?
            if(!searchKeys.every((value) => { return testKeys.indexOf(value) >= 0; })) {
                var err = new Error("1 or more search criteria is not applicable for this type");
                err.statusCode = 400;
                next(err);
                return;
            }
            
            // for each array entry...
            res.locals.items.forEach((entry, index, array) => {
                // value = {"...": "..."}
                // for each search key...
                for(var i = 0; i < searchKeys.length; i++) {
                    var searchKey = searchKeys[i];
                    // look up if it matches search criteria
                    if(entry[searchKey] != searchKey[searchKey]) {
                        // if not, throw it away and go to the next one
                        res.locals.items.splice(index, 1);
                        break;
                    }
                }
            })
        }

        // filtering the results if there are any elements to be filtered
        if(req.query['filter']) {
            // ex: "title,src,length"
            var filters = req.query['filter'].split(',');
            if(Array.isArray(res.locals.items)) {
                res.locals.items.forEach((value, number, array) => { array[number] = filter(filters, value, next)})
            } else {
                res.locals.items = filter(filters, res.locals.items, next);
            }
        }
        
        // limit and offset - if there's false / missing input, offset is 0
        if(req.query['limit'] && Array.isArray(res.locals.items)) {
            var limit = parseInt(req.query['limit']) || 0;
            if(limit == 0) {
                var err = new Error("fucking Limit is weird of missing or idc");
                err.statusCode = 400;
                next(err);
                return;
            }
            var offset = parseInt(req.query['offset']) || 0;
            res.locals.items.splice(offset, limit);
        }
        
        
        // then we send it as json and remove it
        res.json(res.locals.items);
        delete res.locals.items;
    } else {
        // otherwise we set status to no-content
        res.set('Content-Type', 'application/json');
        // if someone forgot the status and response is empty set it to no content
        res.status(res.status || 204).end();
    }
});

module.exports = router;