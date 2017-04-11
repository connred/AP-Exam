var express = require('express');
var jwt = require('jsonwebtoken'); 
var fs = require('fs');
var app = express();
var moment = require('moment'); 
var request = require('request');
var jwkToPem = require('jwk-to-pem');
var bodyParser = require('body-parser'); 
var bodyParser = require('body-parser'); 
var keyCache = {};
//const MONGO_URL = 'mongodb://localhost:27017/NCMongo';
const CLIENT_ID = '100486091355-kggb1no0knblhq4oi7c8iov1kfnj7aut.apps.googleusercontent.com';
var http = require('http').Server(app);
var webroot = __dirname + '/../client/';
app.use('/', express.static(webroot));
/*Mongo.connect(MONGO_URL, function (err, db) {
    // TODO: handle err
    if (err) log('error?');
    else log('good to go');
    Mongo.ops = {};
    Mongo.ops.find = function (collection, json, callback) {
        db.collection(collection).find(json).toArray(function (err, docs) {
            // TODO: handle err
            if (callback) callback(err, docs);
        });
    };
    Mongo.ops.findOne = function (collection, json, callback) {
        db.collection(collection).findOne(json, function (err, doc) {
            // TODO: handle err
            if (callback) callback(err, doc);
        });
    };
    Mongo.ops.insert = function (collection, json, callback) {
        db.collection(collection).insert(json, function (err, result) {
            // TODO: handle err
            if (callback) callback(err, result);
        });
    };
    Mongo.ops.upsert = function (collection, query, json, callback) {
        db.collection(collection).updateOne(query, {
            $set: json
        }, {
            upsert: true
        }, function (err, result) {
            // TODO: handle err
            if (callback) callback(err, result);
        });
    };
    Mongo.ops.updateOne = function (collection, query, json, callback) {
        db.collection(collection).updateOne(query, {
            $set: json
        }, function (err, result) {
            // TODO: handle err
            if (callback) callback(err, result);
        });
    };
});*/
/*
function allowCrossDomain(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization');
    // end pre flights
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
    }
    else {
        next();
    }
}
*/
var server = http.listen(80, function() {
    console.log('hosting from ' + webroot);
    console.log('server listening on http://localhost/');
});
var users = [];
var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {
    var clientIp = socket.request.connection.remoteAddress;
    console.log('socket connected from ' + clientIp);
    socket.emit('Welcome', {
        text: "Chat here:"
    });
    socket.on('user', function (name) {
        console.log(username + ' connected');
        users.push(username);
        socket.user = username;
        console.log('users : ' + users.length);
        socket.broadcast.emit('otherUserConnect', socket.user);
    });
    socket.on('disconnect', function () {
        if (!socket.user) {
            return;
        }
        if (users.indexOf(socket.user) > -1) {
            console.log(socket.user + ' disconnected');
            users.splice(users.indexOf(socket.user), 1);
            socket.broadcast.emit('otherUserDisconnect', socket.user);
        }
    });
    socket.on('message', function (data) {
        io.sockets.emit('message', {
            user: socket.user
            , message: data
        })
    });
    //
    
});