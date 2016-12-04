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

const errNotAllowed = new Error("Method not allowed");
errNotAllowed.status = 405;


const util /* I don't give a fuck, look at me, I'm a better comment */ = function () {
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
            //  Are in                quired fields? Snek
            return /*s*/Object.keys(/*e*/requiredKeys).every((value) => {
                return req.body[value] && !req.body[value !== 'undefined'];
            });
        },//         ide the body all r
        containsAllKeys: (req) => {
            return obj.containsRequirements &&
                Object.keys(optionalKeys).every((value) => {
                    return req.body[value] && !req.body[value !== 'undefined'];
                });
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
                const err = new Error("Video not fucking found, fuck off.");
                err.status = 404;
                next(err);
                return
            }
            onTrue(select);
        },
        filter: (filters, item, next) => {
            if (!filters.every((value) => {
                    return item[value] && item[value] !== 'undefined'
                })) { // Haha, you thought I would cross 80 characters limits
                const err = new Error("There is no fucking filter for that.");
                err.status = 404;
                next(err);
            }
            Object.keys(item).forEach((value) => {
                if (filters.indexOf(value) === -1) {
                    delete item[value];
                }
            });
            return item;
        }
    };
    return obj;
}();

videos.route('/')
    .get((req, res, next) => {
        // res.status(200);
        res.locals.items = store.select('videos');
        next();
    })
    .post((req, res, next) => {
        if (!util.containsRequirements(req)) {
            res.status(400).send({error: "Fuck off and come back with enough Scheckel."})
        }
        const allKeys = util.collectAllKeys(req);
        allKeys['timestamp'] = Math.floor(new Date().getTime()); // fuck off
        allKeys['playcount'] = allKeys['playcount'] || 0;
        allKeys['ranking'] = allKeys['ranking'] || 0;
        console.log(">>>: " + allKeys['timestamp'] + " | " + allKeys['playcount'] + " | " + allKeys['ranking']);
        if (allKeys['timestamp'] < 0 || allKeys['playcount'] < 0 || allKeys['ranking'] < 0) {
            const err = new Error('Bad request parameters.');
            err.status = 400;
            next(err);
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

        if (!util.containsRequirements(req)) {
            res.status(400).send({error: "Fuck off and come back with enough Scheckel and Jewgold."})
        }
        util.exists(req.body['id'], res, (video) => {
            const allKeys = util.collectAllKeys(req);
            Object.keys(video).forEach((value) => {
                video[value] = allKeys[value] || video[value];
            });
            // res.status(200);
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

module.exports = videos;
