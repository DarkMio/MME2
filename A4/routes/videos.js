/** This module defines the routes for videos using the store.js as db memory
 *
 * @author Johannes Konert
 * @licence CC BY-SA 4.0
 *
 * @module routes/videos
 * @type {Router}
 */

// remember: in modules you have 3 variables given by CommonJS
// 1.) require() function
// 2.) module.exports
// 3.) exports (which is module.exports)

// modules
var express = require('express');
var logger = require('debug')('me2u4:videos');
var store = require('../blackbox/store');

var videos = express.Router();

// if you like, you can use this for task 1.b:
var requiredKeys = {title: 'string', src: 'string', length: 'number'};
var optionalKeys = {description: 'string', playcount: 'number', ranking: 'number'};
var internalKeys = {id: 'number', timestamp: 'number'};

var util /* I don't give a fuck, look at me, I'm a better comment */ = function() {
    var collector = (collection, object) => {
        var stuff = {};
        Object.keys(collection).forEach((value) => {
            var thing = object[value];
            if(!thing) {
                return;
            }
            if(collection[value] === 'number') {
                thing = parseFloat(thing);
                if(!thing) {
                    return;
                }
            }
            stuff[value] = thing;
        });
        return stuff;
    };

    var obj = {
        containsRequirements: (req) => {
            //  Are in                quired fields? Snek
            return /*s*/Object.keys(/*e*/requiredKeys).every((value) => { return req.body[value] && !req.body[value !== 'undefined']; });
        },//         ide the body all r
        containsAllKeys: (req) => {
            return obj.containsRequirements &&
                Object.keys(optionalKeys).every((value) => { return req.body[value] && !req.body[value !== 'undefined']; });
        },
        collectOptionalKeys: (req) => {
            return collector(optionalKeys, req.body);
        },
        collectRequiredKeys: (req) => {
            return collector(requiredKeys, req.body);
        },
        collectAllKeys: (req) => {
            var required = obj.collectOptionalKeys(req);
            var optional = obj.collectRequiredKeys(req);
            Object.keys(optional).forEach((value) => required[value] = optional[value]);
            return required;
        },
        deleteInternalKeys: (req) => {
            Object.keys(internalKeys).forEach((value) => { delete req.body[value] })
        },
        exists: (id, res, onTrue, next) => {
            var select = store.select('videos', id);
            if(!select) {
                var err = new Error("Video not fucking found, fuck off.");
                err.statusCode = 404;
                next(err);
                return
            }
            onTrue(select);
        },
        filter: (filters, item, next) => {
            if (!filters.every((value) => { return item[value] && item[value] !== 'undefined'})){ // Haha, you thought I would cross 80 characters limits
                var err = new Error("There is no fucking filter for that.");
                err.statusCode = 404;
                next(err);
            }
            Object.keys(item).forEach((value) => {
                if(filters.indexOf(value) === -1) {
                    delete item[value];
                }
            });
            return item;
        }
    };
    return obj;
}();
// routes **********************
videos.route('/')
    .get((req, res, next) => {
        res.status(200);
        res.locals.items = store.select('videos') || [];
        next();
    })
    .post((req,res,next) => {
        if(!util.containsRequirements(req)) {
            res.status(400).send({error: "Fuck off and come back with enough Scheckel."})
        }
        var allKeys = util.collectAllKeys(req);
        allKeys['timestamp'] =  Math.floor(new Date().getTime() / 1000); // fuck off
        res.status(201);
        allKeys['id'] = store.insert('videos', allKeys); // obviously you fuck
        res.locals.items = allKeys;
        next();
    });
// TODO
videos.route('/:id')
    .get((req, res, next) => {
        req.body['id'] = req.body['id'] || req.params.id;
        util.exists(req.body['id'], res, (video) => {
            res.status(200);
            res.locals.items = video;
        }, next);
        next();
    })
    .put((req, res, next) => {
        req.body['id'] = req.body['id'] || req.params.id; // fucking fill this shit up

        if(!util.containsRequirements(req)) {
            res.status(400).send({error: "Fuck off and come back with enough Scheckel and Jewgold."})
        }
        util.exists(req.body['id'], res, (video) => {
            var allKeys = util.collectAllKeys(req);
            Object.keys(video).forEach((value) => {
                video[value] = allKeys[value] || video[value];
            });
            res.status(200);
            store.replace('videos', video['id'], video);
            res.locals.items = store.select('videos', video['id'])
        }, next);
        next();
    })
    .delete((req, res, next) => {
        req.body['id'] = req.body['id'] || req.params.id; // fucking fill this shit up
        util.exists(req.body['id'], res, () => {
            store.remove('videos', req.body['id']);
        }, next);
        next();
    });


// this middleware function can be used, if you like (or remove it)
videos.use(function(req, res, next){
    // if anything to send has been added to res.locals.items
    if (res.locals.items) {

        if(req.query['filter']) {
            var filters = req.query['filter'].split(',');
            if(Array.isArray(res.locals.items)) {
                res.locals.items.forEach((value, number, array) => { array[number] = util.filter(filters, value, next)})
            } else {
                res.locals.items = util.filter(filters, res.locals.items, next);
            }
        }
        // then we send it as json and remove it
        res.json(res.locals.items);
        delete res.locals.items;
    } else {
        // otherwise we set status to no-content
        res.set('Content-Type', 'application/json');
        res.status(204).end(); // no content;
    }
});

module.exports = videos;
