/**
 * These utility functions have no santiy checks.
 * Please handle with care an do the recommended checks somewhere else.
 * This entire section feels like hammering with a saw - but so does js too
 * (Please: Get off my lawn!)
 */
module.exports = function(store, host, port) {
    var tweetNotFound = new Error("Tweet not found");
    tweetNotFound.status = 404; // not found
    var userNotFound = new Error("User not found");
    userNotFound.status = 404;

    function _generateUserPath(id) {
        // could be refactored
        var portName = port == 80 ? "" : ":" + port;
        return "http://" + host + portName + "/users/" + id;
    }

    function _generateTweetPath(id) {
        var portName = port == 80 ? "" : ":" + port;
        return "http://" + host + portName + "/tweets/" + id;
    }

    /**
     * @param {(object|number)} Tweet Object from storage or its id
     */
    return {
        returnTweet: function (tweet, expand) {
            // Basically an input selector if not an object
            if (typeof tweet !== typeof {}) {
                tweet = store.select('tweets', tweet);
            }
            var x = {
                'id': tweet.id,
                'message': tweet.message,
                'user': { // api/users/:id
                    'href': _generateUserPath(tweet.user)
                }
            };
            if(expand === true) {
                var user = store.select('users', tweet.user);
                for(var key in user) {
                    //noinspection JSUnfilteredForInLoop
                    x.user[key] = user[key];
                }
            }
            return x;
        },

        /**
         * @param {(object|number)} User Object from storage or its id
         */
        returnUser: function (user, expand) {
            if (typeof user !== typeof {}) {
                user = store.select('users', user);
            }
            var x = {
                'id': user.id,
                'firstname': user.firstname,
                'lastname': user.lastname,
                'tweets': { // api/users/:id/tweets ...
                    'href': _generateUserPath(user.id) + "/tweets"
                }
            };
            if(expand === true) {
                var obj = this;
                var collect = store.select('tweets').filter((T) => {return T.user == x.id});
                collect.forEach((T, index) => collect[index] = obj.returnTweet(T));
                x.tweets.items = collect;
            }
            return x;
        },
        checkTweet: function(id, next, onFound) {
            var thing = store.select("tweets", id);
            if(thing === undefined) {
                next(tweetNotFound);
                return;
            } else if(onFound) {
                onFound(thing);
            }
            return thing;
        },
        checkUser: function(id, next, onFound) {
            var thing = store.select("users", id);
            if(thing === undefined) {
                next(userNotFound);
                return;
            } else if(onFound) {
                onFound(thing);
            }
            return thing;
        },
        expandParser: function(req) {
            if(!'expand' in req.query) {
                return false;
            }
            return req.query.expand === 'true';
        }
    }
};