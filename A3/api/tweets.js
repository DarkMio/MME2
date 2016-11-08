"use strict";

function setup(store) {
    var router = require('express').Router();


    router.get('/', function (req, res, next) {
        res.json(store.select('tweets'));
    });

    router.post('/', function (req, res, next) {
        if (!('user' in req.body) || !('message' in req.body)) {
            var err = new Error("fuck off");
            err.status = 404;
            next(err);
            return;
        }

        var user = store.select('users', req.body.user);
        if (user === undefined) {
            var err = new Error("fuck off, no user");
            err.status = 404;
            next(err);
            return;
        }
        var storage = {};
        storage['creator'] = {'href': "http://" + HOST + ":" + PORT + "/users/" + user.id};
        storage['message'] = req.body.message;

        var id = store.insert('tweets', storage);
        // set code 201 "created" and send the item back
        res.status(201).json(store.select('tweets', id));
    });


    router.get('/:id', function (req, res, next) {
        res.json(store.select('tweets', req.params.id));
    });

    router.delete('/:id', function (req, res, next) {
        store.remove('tweets', req.params.id);
        res.status(200).end();
    });

    router.put('/:id', function (req, res, next) {
        store.replace('tweets', req.params.id, req.body);
        res.status(200).end();
    });

    return router;
}

module.exports = setup;
