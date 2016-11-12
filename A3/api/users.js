"use strict";
function setup(store, host, port) {
    var router = require('express').Router();
    var util = require("./util.js")(store, host, port);
    var notEnoughParams = new Error("Not enough parameters for operation");
    notEnoughParams.status = 400; // bad request
    var notFound = new Error("No user found");
    notFound.status = 404;

    router.get('/', function(req, res, next) {
        var users = store.select('users');
        users.forEach(function(T, index) {
            users[index] = util.returnUser(T);
        });
        res.status(200).json(users);
    });
    
    router.post('/', function(req, res, next) {
        if(!('firstname' in req.body || 'lastname' in req.body)){
            next(notEnoughParams);
        }
        
        // in place so a retard doesn't do stupid shit >:(
        var object = {};
        object.firstname = req.body.firstname;
        object.lastname = req.body.lastname;
        var id = store.insert('users', object);
        res.status(201).json(util.returnUser(id));
    });
    
    router.get('/:id', function(req, res, next) {
        var id = util.checkUser(req.params.id, next);
        res.status(200).json(util.returnUser(id));
    });

    router.put("/:id", function(req, res, next) {
        var user = util.checkUser(req.params.id, next);
        if(!'firstname' in req.body && !'lastname' in req.body){
            next(notEnoughParams);
        }
        if('firstname' in req.body) {
            user['firstname'] = req.body['firstname'];
        }
        if('lastname' in req.body) {
            user['lastname'] = req.body['lastname'];
        }

        store.replace("users", req.params.id, user);
        res.status(200).json(util.returnUser(user));
    });

    router.delete("/:id", function(req, res, next) {
        util.checkUser(req.params.id, next);
        store.remove("users", req.params.id);
        res.status(200).end();
    });


    router.get('/:id/tweets', function(req, res, next) {
        var user = util.checkUser(req.params.id, next);
        var tweets = store.select('tweets');
        tweets = tweets
            .filter(function(T) {
                return T.user == req.params.id;
            });
        tweets.forEach(function(T, index) {
                tweets[index] = util.returnTweet(T);
            });
        res.status(200).json({
            'id': user.id,
            'tweets': tweets
        });
    });

    return router;
}

module.exports = setup;















