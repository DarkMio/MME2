/** Tweets Router for paths like /tweets/:id/ etc
 * This is a refactor of the original source, which featured no checks for any data
 * and kept throwing 500 Internal Server Errors.
 * 
 * @author Fabian Wendland
 */

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

    router.get('/', function (req, res) {
        var tweets = store.select('tweets');
        tweets.forEach(function(T, index) {
            tweets[index] = util.returnTweet(T, util.expandParser(req));
        });
        res.status(200).json(tweets);
    });

    router.post('/', function (req, res, next) {
        if (!('user' in req.body && 'message' in req.body)) {
            next(notEnoughParams);
        }

        var user = util.checkUser(req.body.user, next, (user) => {
            var storage = {};
            storage['user'] = user.id;
            storage['message'] = req.body.message;

            var id = store.insert('tweets', storage);
            // set code 201 "created" and send the item back
            res.status(201).json(util.returnTweet(id));
        });
    });

    router.get('/:id', function (req, res, next) {
        util.checkTweet(req.params.id, next, (tweet) => {
            res.json(util.returnTweet(tweet, util.expandParser(req)));
        });
    });

    router.delete('/:id', function (req, res, next) {
        util.checkTweet(req.params.id, next, (tweet) => {
            store.remove('tweets', tweet.id);
            res.status(200).end();
        });
    });

    router.put('/:id', function(req, res, next) {
        util.checkTweet(req.params.id, next, (tweet) => {
            if(!('user' in req.body && 'message' in req.body)){
                next(notEnoughParams);
            }
            var user = util.checkUser(req.body.user, next, (user) => {
                tweet['user'] = user.id;
                tweet['message'] = req.body['message'];
                store.replace('tweets', req.params.id, tweet);
                res.status(200).json(util.returnTweet(tweet));
            });
        });
    });

    router.patch('/:id', function (req, res, next) {
        util.checkTweet(req.params.id, next, (tweet) => {
            if(!('user' in req.body || 'message' in req.body)) {
                next(notEnoughParams);
            }
            util.checkUser(req.body.user, next, (user) => {
                if('user' in req.body) {
                    tweet['user'] = user.id;
                }
                if('message' in req.body) {
                    tweet['message'] = req.body['message'];
                }
                store.replace('tweets', req.params.id, tweet);
                res.status(200).json(util.returnTweet(tweet));
            });
        });
    });

    router.get('/:id/author', function(req, res, next){
        util.checkTweet(req.params.id, next, (tweet) => {
            res.status(200).json(util.returnUser(tweet.user, util.expandParser(req)));
        });
    });

    return router;
}

module.exports = setup;













