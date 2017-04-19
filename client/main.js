$(document).ready(function () {
    $('#croom').click(function () {
        var input = $('#roomname');
        var room = input.val().trim();
        if (room.length > 0) {
            socket.emit('croom', room);
        }
        input.val('');
    });
    socket.on('croom', function (data) {
        $('#roomlist').append('<div><strong>' + data.room + '</strong></div>');
        console.log('Room created', data.room);
    });
    $("#roomname").keyup(function (event) {
        if (event.keyCode == 13) {
            $("#croom").click();
        }
    });
});
var socket = io.connect();

function route(url) {
    return 'http://130.211.216.160:3000' + url
}
///
var username;
var profile; // google user profile
var authResponse; // google user auth response
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
        }
        //post('/login', login);
    $('.g-signin2').hide();
    $('.signout').prop('hidden', false);
    var txt = login.name;
    console.log(txt + '//client side log');
    if (txt.length > 0) {
        username = txt;
        $('#controls').show();
        $('#log').prop('hidden', false);
        $('#message').prop('disabled', false);
        $('#send').prop('disabled', false);
        socket.emit('user', username);
    }
    /*get('/addrooms', function (data) {
        for (var i = 0; i < data.length; i++) {
            if (data[i].id && data[i].text) {
                $('#rooms').append('<div><strong><span>' + data[i].text + '</span></strong></div>');
            }
        }
    });*/
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

function put(url, json, success, error) {
    $.ajax({
        url: route(url)
        , method: 'PUT'
        , data: json
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