"use strict";
var express = require('express');
var path = require('path');
var fs = require('fs');
var fileMemo = function() { // obviously no callback hell.
    var memo = null;
    return function (callback, forceReload) {
        if(forceReload === true || memo === null) {
            fs.readFile("./public/data/file.txt", 'utf8', function(err, contents) {
                if(err) {
                    throw err;
                }
                memo = contents;
                callback(memo);
            });
        } else {
            callback(memo);
        }
    }
}();

var app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.get('/test', function(req, res) {
    console.log("> Serving new request from " + req.connection.remoteAddress);
    res.send('Hello world.');
});
app.get('/time', function(req, res) {
    res.setHeader('content-type', 'text/plain');
    res.send(new Date().getTime() + "");
});
app.get('/file.txt', function(req, res) {
    var begin = process.hrtime()[1];
    fileMemo(function(result) {
        var end = process.hrtime()[1] - begin;
        res.setHeader('content-type', 'text/plain');
        res.send("Done: " + end + "ns\n" + result);
    });

});

app.listen(3000, function(){
    console.log("Listening on port 3000.");
});

