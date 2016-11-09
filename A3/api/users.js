"use strict";
function setup(store, host, port) {
    var router = require('express').Router();
    var util = require("./util.js");
    var notEnoughParams = new Error("Not enough parameters for operation");
    notEnoughParams.status = 400; // bad request
    var notFound = new Error("No user found");
    notFound.status = 404;

    var checkId = function(id, next) {
        var thing = store.select("users", id);
        if(thing === undefined) {
            next(notFound);
        }
        return thing;
    };

    router.get('/', function(req, res, next) {
        return res.json(store.select('users'));
    });
    
    router.post('/', function(req, res, next) {
        if(!('firstname' in req.body || 'lastname' in req.body)){
            next(notEnoughParams);
        }
        
        // in place so a retard doesn't do stupid shit >:(
        var object = {};
        object['firstname'] = req['firstname'];
        object['lastname'] = req['lastname'];
        var id = store.insert('users', object);
        res.status(201).json(util.returnUser(id));
    });
    
    router.get('/:id', function(req, res, next) {
        var id = checkId(req.params.id, next);
        res.status(200).json(util.returnUser(id));
    });

    router.put("/:id", function(res, req, next) {
        checkId(req.params.id, next);
        if(!('firstname' in req.body && 'lastname' in req.body)){
            next(notEnoughParams);
        }
        var obj = {};
        if('firstname' in req.body) {
            obj['firstname'] = req.body['firstname'];
        }
        if('lastname' in req.body) {
            obj['lastname'] = req.body['lastname'];
        }

        store.replace("users", req.params.id, obj);
        res.status(200).end();
    });

    router.delete("/:id", function(req, res, next) {
        checkId(req.params.id, next);
        store.remove("users", req.params.id);
    }
    );

    return router;
}

module.exports = setup;















