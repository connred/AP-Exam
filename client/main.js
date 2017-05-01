var socket = io.connect('http://130.211.216.160');
var messageData;
$(document).ready(function () {
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
    socket.on('activatebot', function (data) {
        var botName = data;
        mathBot(botName);
    });
    socket.on('connect', function () {
        $('#conversation').append('<b>' + 'Welcome' + ':</b> ' + 'Please Sign In to google to chat' + '<br>');
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

function mathBot(botName) {
    $('#conversation').append('<b> MATHBOT:' + ' Hello' + ':</b> ' + botName + '<br>');
    $('#conversation').append('<div id="math"/><div>');
    $('#math').append('<b>' + 'Enter 1st number here' + ':</b> ' + '<input id="numOne"/>' + '<br>');
    $('#math').append('<b>' + 'Choose Operation' + ':</b> ' + '<input id="operation" placeholder="+ or - or / or *"/>' + '<br>');
    $('#math').append('<b>' + 'Enter 2nd number here' + ':</b> ' + '<input id="numTwo"/>' + '<br>');
    $('#math').append('<button id="equals" onclick="calc();">Get Answer</button>');
}
$('#equals').click(function () {
    console.log('a calc button was clicked');
    calc();
});
function calc() {
    var numOne = $('#numOne').val();
    var numTwo = $('#numTwo').val();
    var operation = $('#operation').val();
    if (operation == "+") {
        var answer = numOne + numTwo;
        return answer;
    }
    if (operation == "-") {
        var answer = numOne - numTwo;
        return answer;
    }
    if (operation == "/") {
        var answer = numOne / numTwo;
        return answer;
    }
    if (operation == "*") {
        var answer = numOne * numTwo;
        return answer;
    }
    $('#math').html('');
    $('#conversation').append('<b> MATHBOT:' + ' The answer is' + ':</b> ' + answer + '<br>');
}

function switchRoom(room) {
    socket.emit('switchRoom', room);
    $('#conversation').html('');
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
    $('#conversation').prop('hidden', false);
    $('#data').prop('disabled', false);
    $('#datasend').prop('disabled', false);
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