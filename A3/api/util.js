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
     * @param {object} Response object from node handler
     */
    return {
        returnTweet: function (tweet, response) {
            // Basically an input selector if not an object
            if (typeof tweet !== typeof {}) {
                tweet = store.select('tweets', tweet);
            }

            return {
                'id': tweet.id,
                'message': tweet.message,
                'user': { // api/users/:id
                    'href': _generateUserPath(tweet.user)
                }
            };
        },

        /**
         * @param {(object|number)} User Object from storage or its id
         * @param {object} Response object from node handler
         */
        returnUser: function (user, response) {
            if (typeof user !== typeof {}) {
                user = store.select('users', user);
            }
            return {
                'id': user.id,
                'firstname': user.firstname,
                'lastname': user.lastname,
                'tweets': { // api/users/:id/tweets ...
                    'href': _generateUserPath(user.id) + "/tweets"
                }
            };
        },
        checkTweet: function(id, next) {
            var thing = store.select("tweets", id);
            if(thing === undefined) {
                next(tweetNotFound);
            }
            return thing;
        },
        checkUser: function(id, next) {
            var thing = store.select("users", id);
            if(thing === undefined) {
                next(userNotFound);
            }
            return thing;
        }
    }
};

// @TODO: Check if this works, that it resolves upon loading the public functions