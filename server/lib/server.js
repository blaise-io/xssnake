/*jshint globalstrict:true*/
'use strict';

var fs = require('fs'),
    http = require('http'),
    io = require('socket.io'),

    RoomManager = require('./room_manager.js'),
    Room = require('./room.js'),
    State = require('./state.js');

/**
 * @constructor
 */
function Server(config) {
    this.config = config;
    this.state = new State();
    this.roomManager = new RoomManager();
    this._listen();
}

module.exports = Server;

Server.prototype = {

    _listen: function() {
        var app;

        app = http.createServer(this._httpRequestHandler.bind(this));
        this.io = io.listen(app, {log: false});

        app.listen(80);

        this.io.sockets.on('connection', function(socket) {
            var client = this.state.addClient(socket.id);
            socket.emit('/c/connect', client.id);
            this._addSocketEventHandlers(client, socket);
        }.bind(this));
    },

    /**
     * @param {Client} client
     */
    _addSocketEventHandlers: function(client, socket) {
        this._handleDisconnect(client, socket);
        this._handleRoomget(client, socket);
        this._handleChat(client, socket);
    },

    _handleDisconnect: function(client, socket) {
        socket.on('disconnect', function() {
            var room = this.roomManager.rooms[client.roomid];
            room.removeClient(client);
            room.emit('/c/notice', client.name + ' has left the room!');
            this.state.removeClient(client);
        }.bind(this));
    },

    _handleRoomget: function(client, socket) {
        socket.on('/s/room/get', function(data) {
            var room;

            room = this.roomManager.getPreferredRoom(data);
            room.join(client);

            client.data.name = data.name;
            client.roomid = room.id;

            socket.join(room.id);

            if (room.isFull()) {
                room.emit(this.io, '/c/notice', 'room is full');
            }

            room.emit(this.io, '/c/notice', room.clients);
        }.bind(this));
    },

    _handleChat: function(client, socket) {
        socket.on('/s/chat', function() {
            // todo
        }.bind(this));
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