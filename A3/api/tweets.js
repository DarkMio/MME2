"use strict";

function setup(store, host, port) {
    var router = require('express').Router();


    router.get('/', function (req, res, next) {
        res.json(store.select('tweets'));
    });

    router.post('/', function (req, res, next) {
        if (!('user' in req.body) || !('message' in req.body)) {
            var err = new Error("Not enough data, go home.");
            err.status = 404;
            next(err);
        }

        var user = store.select('users', req.body.user);
        if (user === undefined) {
            var err = new Error("No user found with this id");
            err.status = 404;
            next(err);
        }
        var storage = {};
        storage['creator'] = user.id;
        storage['message'] = req.body.message;

        var id = store.insert('tweets', storage);
        // set code 201 "created" and send the item back
        res.status(201).json(store.select('tweets', id));
    });

    router.get('/:id', function (req, res, next) {
        var tweet = store.select('tweets', req.params.id);
        if(tweet === undefined) {
            var err = new Error("No tweet with this id found");
            err.status = 404;
            next(err);
        }
        res.json(tweet);
    });

    router.delete('/:id', function (req, res, next) {
        try {
            store.remove('tweets', req.params.id);
        } catch (err) {
            var err = new Error("Tweet not found.");
            err.status = 404;
            next(err);
        }
        res.status(200).end();
    });

    router.put('/:id', function (req, res, next) {
        try {
            store.replace('tweets', req.params.id, req.body);
        } catch(err) {
            var err = new Error("Tweet not found.");
            err.status = 404;
            next(err);
        }
        res.status(200).end();
    });

    return router;
}

module.exports = setup;
