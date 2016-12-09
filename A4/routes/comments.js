/** This module defines the routes for comments using the store.js as db memory
 *
 * @author Mio Bambino
 * @licence CC BY-SA 4.0
 *
 * @module routes/comments
 * @type {Router}
 */
"use strict";

const express = require('express');
const store = require('../blackbox/store');

const comments = express.Router();

const requiredKeys = {videoId: 'number', text: 'string'};
const optionalKeys = {likes: 'number', dislikes: 'number'};
const internalKeys = {id: 'number', timestamp: 'timestamp'};

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
        exists: (id, res, type, onTrue, next) => {
            const select = store.select(type, id);
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

comments.route('/')
    .get((req, res, next) => {
        res.locals.items = store.select('comments');
        next();
    })
    .post((req, res, next) => {
        if (!util.containsRequirements(req)) {
            next(util.errorFactory('The request does not contain the required fields', 400));
            return;
        }
        const allKeys = util.collectAllKeys(req);
        allKeys['timestamp'] = Math.floor(new Date().getTime());
        allKeys['likes'] |= 0;
        allKeys['dislikes'] |= 0;
        if (allKeys['timestamp'] < 0 || allKeys['likes'] < 0 || allKeys['dislikes'] < 0) {
            next(util.errorFactory("Bad request parameters", 400));
            return;
        }
        util.exists(allKeys['videoId'], res, 'videos', (video) => {
            allKeys['id'] = store.insert('comments', allKeys);
            res.status(201);
            res.locals.items = allKeys;
        }, next);
        next();
    })
    .put((req, res, next) => {
        next(errNotAllowed);
    })
    .patch((req, res, next) => {
        next(errNotAllowed);
    });

comments.route('/:id')
    .get((req, res, next) => {
        req.body['id'] = req.body['id'] || req.params.id;
        util.exists(req.body['id'], res, 'comments', (comment) => {
            res.locals.items = comment;
        }, next);
        next();
    })
    .post((req, res, next) => {
        next(errNotAllowed);
    })
    .put((req, res, next) => {
        req.body['id'] = req.body['id'] || req.params.id;

        if(!util.containsAllKeys(req)) {
            next(util.errorFactory('Request doesn\'t contain required fields.', 400));
            return;
        }
        util.exists(req.body['id'], res, 'comments', (comment) => {
            util.exists(req.body['videoId'], res, 'videos', (video) => {
                // Video and comment indeed exists.
                const allKeys = util.collectAllKeys(req);
                Object.keys(comment).forEach((value) => {
                    comment[value] = allKeys[value];
                });
                store.replace('comments', comment['id'], comment);
                res.locals.items = store.select('comments', comment['id']);
            }, next)
        }, next);
        next();
    })
    .delete((req, res, next) => {
        req.body['id'] = req.body['id'] || req.params.id;
        util.exists(req.body['id'], res, 'comments', (comment) => {
            store.remove('comments', req.body['id']);
        }, next);
        next();
    })
    .patch((req, res, next) => {
        next(errNotAllowed);
    });

module.exports = comments;