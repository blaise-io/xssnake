/*jshint globalstrict:true*/
'use strict';

var fs = require('fs'),
    http = require('http'),
    io = require('socket.io'),

    EventHandler = require('./event_handler.js'),
    RoomManager = require('./room_manager.js'),
    Room = require('./room.js'),
    State = require('./state.js');

/**
 * @constructor
 */
function Server(config) {
    this.config = config;
    this.state = new State();
    this.roomManager = new RoomManager(this);
    this.listen();
}

module.exports = Server;

Server.prototype = {

    listen: function() {
        var app = http.createServer(this._httpRequestHandler.bind(this));

        this.io = io.listen(app, {log: false});
        app.listen(8080);

        this.io.sockets.on('connection', function(socket) {
            var client = this.state.addClient(socket.id);
            void(new EventHandler(this, client, socket));
        }.bind(this));
    },

    getSocket: function(client) {
        return this.io.sockets.sockets[client.socketid];
    },

    /**
     * @param {Server} request
     * @param {ServerResponse} response
     */
    _httpRequestHandler: function(request, response) {
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
    }

};