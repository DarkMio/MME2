"use strict";

function setup(store, host, port) {
    var router = require('express').Router();
    var util = require('./util.js')(store, host, port);
    var tweetNotFound = new Error("Tweet not found");
    tweetNotFound.status = 404; // not found
    var userNotFound = new Error("User not found");
    userNotFound.status = 404;
    var notEnoughParams = new Error("Not enough parameters for operation");
    notEnoughParams.status = 400; // bad request


    router.get('/', function (req, res, next) {
        res.json(store.select('tweets'));
    });

    router.post('/', function (req, res, next) {
        if (!('user' in req.body) || !('message' in req.body)) {
            next(notEnoughParams);
        }

        var user = store.select('users', req.body.user);
        if (user === undefined) {
            next(userNotFound);
        }
        var storage = {};
        storage['user'] = user.id;
        storage['message'] = req.body.message;

        var id = store.insert('tweets', storage);
        // set code 201 "created" and send the item back
        res.status(201).json(util.returnTweet(id));
    });

    router.get('/:id', function (req, res, next) {
        var tweet = store.select('tweets', req.params.id);
        if(tweet === undefined) {
            next(tweetNotFound);
        }
        res.json(util.returnTweet(tweet));
    });

    router.delete('/:id', function (req, res, next) {
        try {
            store.remove('tweets', req.params.id);
        } catch (err) {
            next(tweetNotFound);
        }
        res.status(200).end();
    });

    router.put('/:id', function (req, res, next) {
        try {
            store.replace('tweets', req.params.id, req.body);
        } catch(err) {
            next(tweetNotFound);
        }
        res.status(200).end();
    });
    

    return router;
}

module.exports = setup;
