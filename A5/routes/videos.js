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
// const store = require('../blackbox/store');

const videos = express.Router();

const VideoModel = require('../models/videos.js');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/mme2');

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
        let filterGroup = "";
        let limit = -1;
        let offset = 0;
        if(req.query['filter']) {
            filterGroup = req.query['filter'].split(',').join(" ");
        }

        if(req.query['limit']) {
            limit = parseInt(req.query['limit']) || 0;
            if(isNaN(limit) || limit < 1) {
                next(util.errorFactory("Limit is invalid", 400));
                return;
            }
        }

        if(req.query['offset']) {
            offset = parseInt(req.query['offset']);
            if(isNaN(offset) || offset < 0) {
                next(util.errorFactory("Offset is invalid", 400));
                return;
            }
        }

        VideoModel.find({}, filterGroup, function(err, videos) {
            if(!err) {
                res.locals.items = videos;
                next();
            } else {
                next(err);
            }
        })
        .limit(limit)
        .skip(offset);
    })
    .post((req, res, next) => {
        const video = new VideoModel(req.body);
        video.save(function(err) {
            if(!err) {
                res.locals.items = video;
                next();
            } else {
                next(err);
            }
        });
    })
    .put((req, res, next) => {
        next(errNotAllowed);
    })
    .delete((req, res, next) => {
        next(errNotAllowed);
    })
    .patch((req, res, next) => {
        next(errNotAllowed);
    });

videos.route('/:id')
    .get((req, res, next) => {
        req.body['_id'] = req.body['_id'] || req.params.id;
        VideoModel.find({_id: req.body['_id']}, function(err, videos) {
            if(!err) {
                res.locals.items = videos[0];
                next();
            } else {
                next(err);
            }
        });
    })
    .post((req, res, next) => {
        next(errNotAllowed);
    })
    .put((req, res, next) => {
        // req.body['_id'] = req.body['_id'] || req.params.id;
        const schema = Object.keys(VideoModel.schema.paths);
        const body = Object.keys(req.body);
        if(!Object.keys(VideoModel.schema.paths).every((x) => { return Object.keys(req.body).indexOf(x) >= 0 })) {
            next(util.errorFactory("Not all keys are present.", 400));
        }
        delete req.body.timestamp;
        delete req.body._id;
        VideoModel.findByIdAndUpdate(req.params.id, req.body, {new: true, setDefaultsOnInsert: true}, function(err, item) {
            if(!err) {
                res.locals.items = item;
                next();
            } else {
                next(err);
            }
        });
    })
    .delete((req, res, next) => {
        req.body['_id'] = req.body['_id'] || req.params.id;
        const video = new VideoModel(req.body);
        VideoModel.findByIdAndRemove(req.body['_id'], function(err, item) {
            if(!err) {
                res.status(204);
                next();
            } else {
                next(err);
            }
        });
    })
    .patch((req, res, next) => {
        req.body['_id'] = req.body['_id'] || req.params.id;
        delete req.body.timestamp;
        delete req.body._id;
        VideoModel.findByIdAndUpdate(req.params.id, req.body, function(err, item) {
            if(!err) {
                res.locals.items = item;
                next();
            } else {
                next(err);
            }
        })
    });

module.exports = videos;
