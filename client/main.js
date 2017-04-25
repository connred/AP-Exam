var socket = io.connect();

$(document).ready(function () {
    socket.on('connect', function(){
		// call the server-side function 'adduser' and send one parameter (value of prompt)
		//socket.emit('adduser', prompt("What's your name?"));
	});

	// listener, whenever the server emits 'updatechat', this updates the chat body
	socket.on('updatechat', function (username, data) {
		$('#conversation').append('<b>'+username + ':</b> ' + data + '<br>');
	});

	// listener, whenever the server emits 'updaterooms', this updates the room the client is in
	socket.on('updaterooms', function(rooms, current_room) {
		$('#rooms').empty();
		$.each(rooms, function(key, value) {
			if(value == current_room){
				$('#rooms').append('<div>' + value + '</div>');
			}
			else {
				$('#rooms').append('<div><a href="#" onclick="switchRoom(\''+value+'\')">' + value + '</a></div>');
			}
		});
	});
});
function switchRoom(room){
		socket.emit('switchRoom', room);
	}

	// on load of page
	$(function(){
		// when the client clicks SEND
		$('#datasend').click( function() {
			var message = $('#data').val();
			$('#data').val('');
			// tell server to execute 'sendchat' and send along one parameter
			socket.emit('sendchat', message);
		});

		// when the client hits ENTER on their keyboard
		$('#data').keypress(function(e) {
			if(e.which == 13) {
				$(this).blur();
				$('#datasend').focus().click();
			}
		});
	});


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

        socket.emit('adduser', login);
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