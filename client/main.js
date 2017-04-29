var socket = io.connect('http://130.211.216.160');
var primaryLog = {
    Primary: []
    , Alternate: []
};
$(document).ready(function () {
    function logMessages(username, data, rooms, current_room) {
        var messageData = {
            'user': username
            , 'messageContent': data
            , 'current_room': rooms
        };
        console.log('logmessages //' + rooms);
        //primaryLog[current_room].push(messageData);
        return primaryLog;
    }
    socket.on('connect', function () {});
    socket.on('updatechat', function (username, data, rooms, current_room) {
        $('#conversation').append('<b>' + username + ':</b> ' + data + '<br>');
        logMessages(username, data, rooms, current_room);
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
    console.log('switchrooms //' + room);
    for (var i = 0; i < primaryLog[room].length; i++) {
            if (data[i].user && data[i].messageContent) {
                $('#conversation').append('<b>' + user + ':</b> ' + messageContent + '<br>');
            }
    }
}

$(function () {
    $('#datasend').click(function () {
        var message = $('#data').val();
        $('#data').val('');
        socket.emit('sendchat', message);
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
    $('.signout').prop('hidden', true);
    $('.g-signin2').show();
}

function disconnect() {
    gapi.auth2.getAuthInstance().disconnect();
    socket.emit('disconnect');
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