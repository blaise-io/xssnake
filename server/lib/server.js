/*jshint globalstrict:true, es5:true, node:true*/
'use strict';

var fs = require('fs'),
    http = require('http'),
    io = require('socket.io'),

    config = require('../shared/config.js'),

    EventHandler = require('./event_handler.js'),
    RoomManager = require('./room_manager.js'),
    Room = require('./room.js'),
    State = require('./state.js'),
    Ticker = require('./ticker.js');

/**
 * @constructor
 */
function Server() {
    this.state = new State(this);
    this.roomManager = new RoomManager(this);
    this.ticker = new Ticker(config.shared.game.tick);
    this.listen();
}

module.exports = Server;

Server.prototype = {

    listen: function() {
        var server = http.createServer(this._httpRequestHandler.bind(this));

        this.io = io.listen(server, {log: false});
        this.io.set('browser client etag', true);
        this.io.set('browser client gzip', true);
        this.io.set('browser client minification', true);

        server.listen(8080); // TODO in config

        this.io.sockets.on('connection', function(socket) {
            var client = this.state.addClient(socket);
            void(new EventHandler(this, client, socket));
        }.bind(this));
    },

    /**
     * @param {Server} request
     * @param {ServerResponse} response
     */
    _httpRequestHandler: function(request, response) {
        var file, onIndexFileRead;

        // TODO make path to file more solid
        file = __dirname + '/../../' + config.server.pathToIndexFile;
        onIndexFileRead = function(err, data) {
            if (err) {
                response.writeHead(500);
                return response.end('Error loading ' + file);
            }
            response.writeHead(200);
            return response.end(data);
        };

        fs.readFile(file, onIndexFileRead);
    }

};