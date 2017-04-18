var express = require('express');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var app = express();
var moment = require('moment');
var request = require('request');
var jwkToPem = require('jwk-to-pem');
var bodyParser = require('body-parser');
var bodyParser = require('body-parser');
var socketio = require('socket.io');
var keyCache = {};
//const MONGO_URL = 'mongodb://localhost:27017/NCMongo';
const CLIENT_ID = '100486091355-flibl0f1jtafr4hahh9pueomqgb2533o.apps.googleusercontent.com';
var http = require('http');
var https = require('https');
var webroot = __dirname + '/../client/';
///////////////////////////////////////////
app.use('/', express.static(webroot));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(allowCrossDomain);
app.use(authorize);

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

function authorize(req, res, next) {
    // jwt.decode: https://github.com/auth0/node-jsonwebtoken#jwtdecodetoken--options
    // jwt.verify: https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
    try {
        var token = req.headers.authorization;
        var decoded = jwt.decode(token, {
            complete: true
        });
        var keyID = decoded.header.kid;
        var algorithm = decoded.header.alg;
        var iss = decoded.payload.iss;
        var pem = getPem(keyID);
        if (iss === 'accounts.google.com' || iss === 'https://accounts.google.com') {
            var options = {
                audience: CLIENT_ID
                , issuer: iss
                , algorithms: [algorithm]
            }
            jwt.verify(token, pem, options, function (err) {
                if (err) {
                    res.writeHead(401);
                    res.end();
                }
                else {
                    next();
                }
            });
        }
        else {
            res.writeHead(401);
            res.end();
        }
    }
    catch (err) {
        res.writeHead(401);
        res.end();
    }
}
//
/*var options = {
    key: fs.readFileSync('key.pem')
    , cert: fs.readFileSync('cert.pem')
};
http.createServer(function (req, res) {
    res.writeHead(301, {
        'Location': 'https://' + req.headers.host + req.url
    });
    res.end();
}).listen(80);
https.createServer(options, function (req, res) {
    fs.readFile('./client/index.html', function (error, data) {
        response.writeHead(200, {
            'Content-Type': 'text/html'
        });
        response.end(data, 'utf-8');
    });
}).listen(443);
var server = https.createServer(options, app); */
var server = http.listen(80, function () {
    cacheWellKnownKeys();
    console.log('hosting from ' + webroot);
    console.log('server listening on http://localhost/');
}); 


function cacheWellKnownKeys() {
    // get the well known config from google
    request('https://accounts.google.com/.well-known/openid-configuration', function (err, res, body) {
        var config = JSON.parse(body);
        var address = config.jwks_uri; // ex: https://www.googleapis.com/oauth2/v3/certs
        // get the public json web keys
        request(address, function (err, res, body) {
            keyCache.keys = JSON.parse(body).keys;
            // example cache-control header: 
            // public, max-age=24497, must-revalidate, no-transform
            var cacheControl = res.headers['cache-control'];
            var values = cacheControl.split(',');
            var maxAge = parseInt(values[1].split('=')[1]);
            // update the key cache when the max age expires
            setTimeout(cacheWellKnownKeys, maxAge * 1000);
            //log('Cached keys = ', keyCache.keys);
        });
    });
}
////////////////////////////////////////
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
//
var users = [];
var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {
    var clientIp = socket.request.connection.remoteAddress;
    console.log('socket connected from ' + clientIp);
    socket.emit('Welcome', {
        text: "Chat here:"
    });
    socket.on('user', function (username) {
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
    socket.on('croom', function (data) {
        //add mongo funciton for the GET
        io.sockets.emit('croom', {
            room: socket.data
        })
    });
    //
});