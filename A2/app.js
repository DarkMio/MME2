"use strict";
var express = require('express');
var path = require('path');
var app = express();

app.get('/', function(req, res) {
    console.log("> Serving new request.");
    res.send('Hello world.');
});

var server = app.listen(3000, function(){
    console.log("Listening on port 3000.");
});

