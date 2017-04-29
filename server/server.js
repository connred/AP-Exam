var express = require('express');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var app = express();

var moment = require('moment');
var request = require('request');
var jwkToPem = require('jwk-to-pem');
var bodyParser = require('body-parser');

var socketio = require('socket.io');
const CLIENT_ID = '100486091355-flibl0f1jtafr4hahh9pueomqgb2533o.apps.googleusercontent.com';

var http = require('http').Server(app);
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
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
    }
    else {
        next();
    }
}

function authorize(req, res, next) {
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
var server = http.listen(80, function () {
    console.log('hosting from ' + webroot);
    console.log('server listening on http://localhost/');
}); 

var primaryLog = {
    Primary: []
    , Alternate: []
    , currentRoom: null
};
var usernames = {};
var rooms = ['Primary','Alternate'];
var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {
    var clientIp = socket.request.connection.remoteAddress;
    console.log('socket connected from ' + clientIp);
    function logMessages(username, data) {
        messageData = {
            'user': username
            , 'messageContent': data.message
            , 'room': data.room
        };
        primaryLog[messageData.room].push(messageData);
        return primaryLog;
        return messageData;
        
    }
    socket.on('adduser', function(login){
		socket.user = login.name;
        console.log('socket.user= ' + socket.user);
        console.log('login.name= '+ login.name)
		socket.room = 'Primary';
		usernames[login.name] = login.name;
		socket.join('Primary');
		socket.emit('updaterooms', rooms, 'Primary');
	});
    socket.on('sendchat', function (data) {
        data.room = socket.room
        username = socket.user
        logMessages(username, data);
		io.sockets.in(socket.room).emit('updatechat', socket.user, data);
	});
    /*socket.on('logMessages', function (data) {
        primaryLog[data.room].push(data);
        console.log(primaryLog[data.room]);
    });*/
    socket.on('getMessages', function (data){
        console.log(data);
        primaryLog.currentRoom = data;
        socket.emit('addMessages', primaryLog)
    });
    socket.on('switchRoom', function(newroom){
		socket.leave(socket.room);
		socket.join(newroom);
		//socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
		//socket.broadcast.to(socket.room).emit('updatechat', 'CONSOLE', socket.user+' has left this room');
		socket.room = newroom;
		//socket.broadcast.to(newroom).emit('updatechat', 'CONSOLE', socket.user+' has joined this room');
		socket.emit('updaterooms', rooms, newroom);
	});
    socket.on('disconnect', function(){
        delete usernames[socket.user];
		io.sockets.emit('updateusers', usernames);
		//socket.broadcast.emit('updatechat', 'CONSOLE', socket.user + ' has disconnected');
		socket.leave(socket.room);
	});

    //
});