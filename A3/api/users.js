/** Based off the tweets router - basically the same
 *
 * @author Sebastian Nieling
 */

"use strict";
function setup(store, host, port) {
    var router = require('express').Router();
    var util = require("./util.js")(store, host, port);
    var notEnoughParams = new Error("Not enough parameters for operation");
    notEnoughParams.status = 400; // bad request

    router.get('/', function (req, res) {
        var users = store.select('users');
        users.forEach((T, index) => users[index] = util.returnUser(T, util.expandParser(req)));
        res.status(200).json(users);
    });

    router.post('/', function (req, res, next) {
        if (!('firstname' in req.body || 'lastname' in req.body)) {
            next(notEnoughParams);
        }
        // in place so nobody puts more into it than needed
        var object = {};
        object.firstname = req.body.firstname;
        object.lastname = req.body.lastname;
        var id = store.insert('users', object);
        res.status(201).json(util.returnUser(id));
    });

    router.get('/:id', function (req, res, next) {
        util.checkUser(
            req.params.id,
            next,
            (T) => res.status(200).json(util.returnUser(req.params.id, util.expandParser(req)))
        );
    });

    router.put("/:id", function (req, res, next) {
        util.checkUser(req.params.id, next, (user) => {
            if (!('firstname' in req.body && 'lastname' in req.body)) {
                next(notEnoughParams);
                return;
            }
            user['firstname'] = req.body['firstname'];
            user['lastname'] = req.body['lastname'];
            store.replace("users", req.params.id, user);
            res.status(200).json(util.returnUser(user));
        });
    });

    router.patch("/:id", function (req, res, next) {
        util.checkUser(req.params.id, next, (user) => {
            if (!'firstname' in req.body && !'lastname' in req.body) {
                next(notEnoughParams);
                return;
            }
            if ('firstname' in req.body) {
                user['firstname'] = req.body['firstname'];
            }
            if ('lastname' in req.body) {
                user['lastname'] = req.body['lastname'];
            }
            store.replace("users", req.params.id, user);
            res.status(200).json(util.returnUser(user));
        })
    });

    router.delete("/:id", function (req, res, next) {
        util.checkUser(req.params.id, next, (user) => {
            store.remove("users", user.id);
            res.status(200).end();
        });
    });

    router.get('/:id/tweets', function (req, res, next) {
        util.checkUser(req.params.id, next, (user) => {
            var tweets = store.select('tweets');
            tweets = tweets.filter((T) => T.user == req.params.id);
            tweets.forEach((T, index) => tweets[index] = util.returnTweet(T, util.expandParser(req)));
            res.status(200).json({
                'id': user.id,
                'tweets': tweets
            });
        });
    });

    return router;
}

module.exports = setup;















