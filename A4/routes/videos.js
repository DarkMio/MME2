/** This module defines the routes for videos using the store.js as db memory
 *
 * @author Johannes Konert
 * @licence CC BY-SA 4.0
 *
 * @module routes/videos
 * @type {Router}
 * I spy with my little eye a guy that's forgetting "USE FUCKING STRICT"
 */

"use strict";

// remember: in modules you have 3 constiables given by CommonJS
// 1.) require() function
// 2.) module.exports
// 3.) exports (which is module.exports)

// modules
const express = require('express');
const logger = require('debug')('me2u4:videos');
const store = require('../blackbox/store');

const videos = express.Router();

// if you like, you can use this for task 1.b:
const requiredKeys = {title: 'string', src: 'string', length: 'number'};
const optionalKeys = {description: 'string', playcount: 'number', ranking: 'number'};
const internalKeys = {id: 'number', timestamp: 'number'};

const util = function () {
    const collector = (collection, object) => {
        const stuff = {};
        Object.keys(collection).forEach((value) => {
            let thing = object[value];
            if (!thing) {
                return;
            }
            if (collection[value] === 'number') {
                thing = parseFloat(thing);
                if (!thing) {
                    return;
                }
            }
            stuff[value] = thing;
        });
        return stuff;
    };

    const obj = {
        containsRequirements: (req) => {
            // select each and check if they're not undefined
            return Object.keys(requiredKeys).every((value) => {
                return req.body[value] && !req.body[value != 'undefined'];
            });
        },
        containsOptionals: (req) => {
            // select each and check if they're not undefined
            return Object.keys(optionalKeys).every((value) => {
                return req.body[value] && !req.body[value != 'undefined'];
            });
        },
        containsAllKeys: (req) => {
            return obj.containsRequirements(req) && obj.containsOptionals(req);
        },
        collectOptionalKeys: (req) => {
            return collector(optionalKeys, req.body);
        },
        collectRequiredKeys: (req) => {
            return collector(requiredKeys, req.body);
        },
        collectAllKeys: (req) => {
            const required = obj.collectOptionalKeys(req);
            const optional = obj.collectRequiredKeys(req);
            // add each optional to collected required keys and return it
            Object.keys(optional).forEach((value) => required[value] = optional[value]);
            return required;
        },
        deleteInternalKeys: (req) => {
            Object.keys(internalKeys).forEach((value) => {
                delete req.body[value]
            })
        },
        exists: (id, res, onTrue, next) => {
            const select = store.select('videos', id);
            if (!select) {
                next(obj.errorFactory("Video not found", 404));
                return
            }
            onTrue(select);
        },
        errorFactory: (msg, status) => {
            const err = new Error(msg);
            err.status = status;
            return err;
        }
    };
    return obj;
}();

const errNotAllowed = util.errorFactory("Method not allowed", 405);

videos.route('/')
    .get((req, res, next) => {
        res.locals.items = store.select('videos');
        next();
    })
    .post((req, res, next) => {
        if (!util.containsRequirements(req)) {
            next(util.errorFactory("The request does not contain the required fields", 400));
            return;
        }
        const allKeys = util.collectAllKeys(req);
        allKeys['timestamp'] = Math.floor(new Date().getTime()); // fuck off
        allKeys['playcount'] = allKeys['playcount'] || 0;
        allKeys['ranking'] = allKeys['ranking'] || 0;
        if (allKeys['timestamp'] < 0 || allKeys['playcount'] < 0 || allKeys['ranking'] < 0) {
            next(util.errorFactory("Bad request parameters", 400));
            return;
        }
        res.status(201);
        allKeys['id'] = store.insert('videos', allKeys); // obviously you fuck
        res.locals.items = allKeys;
        next();
    })
    .put((req, res, next) => {
        next(errNotAllowed);
    })
    .patch((req, res, next) => {
        next(errNotAllowed);
    });

videos.route('/:id')
    .get((req, res, next) => {
        req.body['id'] = req.body['id'] || req.params.id;
        util.exists(req.body['id'], res, (video) => {
            // res.status(200);
            res.locals.items = video;
        }, next);
        next();
    })
    .post((req, res, next) => {
        next(errNotAllowed);
    })
    .put((req, res, next) => {
        req.body['id'] = req.body['id'] || req.params.id; // fucking fill this shit up

        if (!util.containsAllKeys(req)) {
            next(util.errorFactory("Request doesn't contain required fields", 400));
            return;
        }
        util.exists(req.body['id'], res, (video) => {
            const allKeys = util.collectAllKeys(req);
            Object.keys(video).forEach((value) => {
                video[value] = allKeys[value];
            });
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
    })
    .patch((req, res, next) => {
        /**
         * Note: That's not my fault, but the assignments what's happening in here. :(
         * Sane recommendation:
         * Request Header with Session ID
         * {
         *  "action": "increment",
         *  "field": "playcount",
         *  "actionUUID": some form of hash of session ID + timestamp
         * }
         * This prevents many edge cases, including a client loosing connection and sending multiple increments
         */
        if(req.body['playcount'] !== "+1") {
            next(util.errorFactory("Patch does not confine the given standard", 400));
            return;
        }
        util.exists(req.params.id, res, (element) => {
            element.playcount += 1;
            store.replace('videos', element['id'], element);
            res.locals.items = element;
        });
        next();
    });

module.exports = videos;
