/**
 * Server
 * Starts server. Emits server events to global events object.
 */

/*jshint globalstrict:true */
'use strict';

var events   = global.xss.events;
var clients  = global.xss.clients;
var clientPK = global.xss.clientPK;

var start = function() {

    // Config
    var port      = 1337;

    // NodeJS Modules
    var http      = require('http');
    var websocket = require('websocket');

    // Create server
    var httpServer = http.createServer(function(request, response) {
        response.writeHead(406); // Not acceptable, want ws://
        response.end();
    }).listen(port);

    var server = new websocket.server({
        httpServer: httpServer
    });

    // Yay, we have visitors!
    server.on('request', function(request) {
        var connection = request.accept(null, request.origin),
            client = clientPK;

        clients[clientPK] = connection;
        clientPK++;

        events.emit('/xss/server/connect', client);

        /** @namespace message.utf8Data */
        connection.on('message', function(message) {
            var json = JSON.parse(message.utf8Data);
            console.log('IN', json.action, json.data, client);
            events.emit('/xss/message/' + json.action, json.data, client);
        }.bind(this));

        connection.on('close', function() {
            delete clients[client];
            events.emit('/xss/server/disconnect', client);
        }.bind(this));
    });

};

var send = function(client, action, data) {
    if (!clients[client]) {
        console.warn('Attempting to send data to a disconnected client:', client);
    } else {
        console.log('OUT', action, data, client);
        clients[client].sendUTF(JSON.stringify({
            action: action,
            data:   data
        }));
    }
};

var sendAll = function(action, data) {
    for (var client in clients) {
        if (clients.hasOwnProperty(client)) {
            send(client, action, data);
        }
    }
};

var sendOthers = function(action, data, exclude) {
    for (var client in clients) {
        if (clients.hasOwnProperty(client) && exclude !== client) {
            send(client, action, data);
        }
    }
};

module.exports = {
    start: start,
    send: send,
    sendAll: sendAll,
    sendOthers: sendOthers
};