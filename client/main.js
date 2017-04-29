var socket = io.connect('http://130.211.216.160');
var messageData;
$(document).ready(function () {
    function logMessages(username, data) {
        messageData = {
            'user': username
            , 'messageContent': data.message
            , 'room': data.room
        };
        //primaryLog[messageData.room].push(messageData);
        //return primaryLog;
        return messageData;
    }
    socket.on('addMessages', function (data) {
        console.log(data.currentRoom);
        console.log(data);
        var array = data.currentRoom
        if (array == "Primary") {
            for (var i = 0; i < data.Primary.length; i++) {
                $('#conversation').append('<b>' + data.Primary[i].user + ':</b> ' + data.Primary[i].messageContent + '<br>');
            }
        }
        if (array == "Alternate") {
            for (var i = 0; i < data.Alternate.length; i++) {
                $('#conversation').append('<b>' + data.Alternate[i].user + ':</b> ' + data.Alternate[i].messageContent + '<br>');
            }
        }
    })
    socket.on('connect', function () {
        $('#conversation').append('<b>' + 'Welcome' + ':</b> ' + '<br>');
        var join = "Primary"
        socket.emit('getMessages', join)
    });
    socket.on('updatechat', function (username, data) {
        $('#conversation').append('<b>' + username + ':</b> ' + data.message + '<br>');
    });
    socket.on('updaterooms', function (rooms, current_room) {
        $('#rooms').empty();
        $.each(rooms, function (key, value) {
            if (value == current_room) {
                $('#rooms').append('<div>' + value + '</div>');
            }
            else {
                $('#rooms').append('<div><a href="#" onclick="switchRoom(\'' + value + '\')">' + value + '</a></div>');
            }
        });
    });
});

function switchRoom(room) {
    socket.emit('switchRoom', room);
    $('#conversation').html('');
    $('#conversation').append('<b>' + 'You have connected to' + ':</b> ' + room + '<br>');
    socket.emit('getMessages', room);
}
$(function () {
    $('#datasend').click(function () {
        var message = $('#data').val();
        $('#data').val('');
        var data = {
            'message': message
            , 'room': null
        }
        socket.emit('sendchat', data);
    });
    $('#data').keypress(function (e) {
        if (e.which == 13) {
            $(this).blur();
            $('#datasend').focus().click();
        }
    });
});

function route(url) {
    return 'http://130.211.216.160' + url;
}
///
var username;
var profile;
var authResponse;

function onSignIn(googleUser) {
    profile = googleUser.getBasicProfile();
    authResponse = googleUser.getAuthResponse();
    var login = {
        'id': profile.getId()
        , 'name': profile.getName()
        , 'givenName': profile.getGivenName()
        , 'familyName': profile.getFamilyName()
        , 'imageUrl': profile.getImageUrl()
        , 'email': profile.getEmail()
        , 'hostedDomain': googleUser.getHostedDomain()
    };
    $('.g-signin2').hide();
    $('.signout').prop('hidden', false);
    $('#conversation').prop('disabled', false);
    socket.emit('adduser', login);
}

function signOut() {
    gapi.auth2.getAuthInstance().signOut();
    socket.emit('disconnect');
    $('#conversation').html('');
    $('.signout').prop('hidden', true);
    $('.g-signin2').show();
}

function disconnect() {
    gapi.auth2.getAuthInstance().disconnect();
    socket.emit('disconnect');
    $('#conversation').html('');
    $('.signout').prop('hidden', true);
    $('.g-signin2').show();
}
///
/////
function post(url, json, success, error) {
    $.ajax({
        url: route(url)
        , method: 'POST'
        , data: json
        , headers: {
            'Authorization': authResponse.id_token
        }
        , success: function () {
            if (success) success();
        }
        , error: function () {
            if (error) error();
        }
    });
}

function get(url, success, error) {
    $.ajax({
        url: route(url)
        , method: 'GET'
        , headers: {
            'Authorization': authResponse.id_token
        }
        , success: function (data) {
            if (success) success(data);
        }
        , error: function () {
            if (error) error();
        }
    })
}
//////