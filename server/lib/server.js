/*jshint globalstrict:true*/
'use strict';

var fs = require('fs'),
    http = require('http'),
    io = require('socket.io'),
    State = require('./state.js');

/**
 * @constructor
 */
function Server(config) {
    this.config = config;
    this.state = new State();
    this.start();
}

Server.prototype = {

    start: function() {
        var app, listener;

        app = http.createServer(this.httpRequestHandler.bind(this));
        listener = io.listen(app, { log: false });

        app.listen(80);

        listener.sockets.on('connection', function(socket) {
            var client = this.state.addClient(socket);
            this.addSocketEventHandlers(client, socket);
        }.bind(this));
    },

    /**
     * @param {EventEmitter} socket
     */
    addSocketEventHandlers: function(client, socket) {

        socket.on('disconnect', function() {
            this.state.removeClient(client);
        }.bind(this));

        socket.on('/server/name', function(name) {
            client.data('name', name);
        }.bind(this));

        socket.on('/server/chat', function(message) {
            // TODO: validation
            this.sendOthers(client, '/client/chat', {
                name: client.name,
                message: message
            });
        }.bind(this));

    },

    /**
     * @param {Server} request
     * @param {ServerResponse} response
     */
    httpRequestHandler: function(request, response) {
        var file, onIndexFileRead;

        file = this.config.pathToHTML;
        onIndexFileRead = function(err, data) {
            if (err) {
                response.writeHead(500);
                return response.end('Error loading ' + file);
            }
            response.writeHead(200);
            response.end(data);
        };

        fs.readFile(file, onIndexFileRead);
    },

    /**
     * @param {Client} client
     * @param {string} action
     * @param {*} data
     */
    send: function(client, action, data) {
        client.socket.emit(action, data);
    },

    /**
     * @param {string} action
     * @param {*} data
     */
    sendAll: function(action, data) {
        for (var client in global.state.clients) {
            if (global.state.clients.hasOwnProperty(client)) {
                this.send(client, action, data);
            }
        }
    },

    /**
     * @param {Client} exclude
     * @param {string} action
     * @param {*} data
     */
    sendOthers: function(exclude, action, data) {
        for (var client in global.state.clients) {
            if (global.state.clients.hasOwnProperty(client) && exclude.id !== client) {
                this.send(client, action, data);
            }
        }
    }

};

module.exports = Server;