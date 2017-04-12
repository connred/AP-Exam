$(document).ready(function () {
    var socket = io.connect();
    socket.on('Welcome', function (data) {
        $('#log').append('<div><strong>' + data.text + '</strong></div>');
    });
    var name;
    /*$('#pass-enter').click(function () {
        var password = $('#pass-input');
        var realpassword = 'apcs';
        var pwd = password.val().trim();
        if (password.val().trim() === realpassword) {
            $('.g-signin2').prop('hidden', false);
            $('#user').prop('hidden', false);
            $('#pass-input').prop('hidden', true);
            $('#pass-enter').prop('hidden', true);
            $('#span1').prop('hidden', true);
        }
        else {
            alert('Incorrect Password');
        }
    });*/
    /*$('#user-save').click(function () {
        var username = $('#user-name');
        var txt = username.val().trim();
        console.log(txt);
        if (txt.length > 0) {
            name = txt;
            username.prop('hidden', true);
            $('#span2').hide();
            $(this).hide();
            $('#controls').show();
            $('#show-button').prop('hidden, true');
            $('#log').prop('hidden', false);
            $('#message').prop('disabled', false);
            $('#send').prop('disabled', false);
            socket.emit('user', name);
        }
    });*/
    $('#send').click(function () {
        var input = $('#message');
        var text = input.val().trim();
        if (text.length > 0) {
            socket.emit('message', text);
            //console.log('Message sent by', name,":'",text,"'");
        }
        input.val('');
    })
    socket.on('message', function (data) {
        $('#log').append('<div><strong>' + data.user + ': ' + data.message + '</strong></div>');
        console.log('Message sent by', data.user, ":'", data.message, "'");
    });
    socket.on('otherUserConnect', function (data) {
        $('#log').append('<div><strong>' + data + ' connected</strong></div>');
    });
    socket.on('otherUserDisconnect', function (data) {
        $('#log').append('<div><strong>' + data + ' disconnected</strong></div>');
    });
    socket.on('displayname', function () {
            $('#user').append('<span>' + 'You choose the name: ' + socket.user + '</span>');
        })
        // Pressing enter sends
    $("#user-name").keyup(function (event) {
        if (event.keyCode == 13) {
            $("#user-save").click();
        }
    });
    $("#pass-input").keyup(function (event) {
        if (event.keyCode == 13) {
            $("#pass-enter").click();
        }
    });
    $("#message").keyup(function (event) {
        if (event.keyCode == 13) {
            $("#send").click();
        }
    });
});
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
    post('/login', login);
    $('.g-signin2').hide();
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
    $('.g-signin2').show();
}

function disconnect() {
    gapi.auth2.getAuthInstance().disconnect();
    $('.g-signin2').show();
}

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