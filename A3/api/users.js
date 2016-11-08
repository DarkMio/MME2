"use strict";
function setup(store) {
    var router = require('express').Router();

    router.get('/', function(req, res, next) {
        return res.json(store.select('users'));
    });

    return router;
}

module.exports = setup;