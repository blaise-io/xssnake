/*global XSS: true */

XSS.WebSocket = function() {
    'use strict';

    return;
    // TODO ENABLE
    // TODO Switch to socket.io?

    var SupportedWebSocket = XSS.getWebSocket(),

        socket = new SupportedWebSocket('ws://127.0.0.1:1337'),

        send = function(action, data) {
            console.log(['OUT', action, data]);
            socket.send(JSON.stringify({
                action: action,
                data: data
            }));
        };

    socket.onopen = function() {
        $(document).trigger('/xss/socket/open');
    };

    socket.onclose = function() {
        $(document).trigger('/xss/socket/close');
    };

    socket.onmessage = function(message) {
        var json = JSON.parse(message.pixels);
        console.log(['IN', json.action, json.pixels]);
        $(document).trigger('/xss/client/' + json.action, [json.pixels]);
    };

    return {
        send: send
    };
};