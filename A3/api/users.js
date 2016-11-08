"use strict";
function setup(store, host, port) {
    var router = require('express').Router();

    router.get('/', function(req, res, next) {
        return res.json(store.select('users'));
    });

    return router;
}

module.exports = setup;