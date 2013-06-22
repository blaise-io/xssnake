/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var http = require('http');
var png = require('pngparse');
var sockjs = require('sockjs');
var nodeEvents = require('events');
var config = require('../shared/config.js');
var Util = require('../shared/util.js');
var RoomManager = require('./room_manager.js');
var Client = require('./client.js');
var levels = require('../shared/levels.js');
var LevelData = require('../shared/level_data.js');
var EventHandler = require('./event_handler.js');

/**
 * @constructor
 */
function Server() {
    this.pubsub = this.setupPubSub();
    this.roomManager = new RoomManager(this);
    this._server = null;
}

module.exports = Server;

Server.prototype = {

    destruct: function() {
        if (this._server) {
            this._server.close();
        }
    },

    /**
     * @param {Array.<LevelData>} levels
     * @param {number=} port
     */
    start: function(levels, port) {
        this.port = port || config.SERVER_PORT;
        this.levels = levels;
        this.listen(this.port);
    },

    /**
     * @param {function(Array.<LevelData>)} callback
     */
    preloadLevels: function(callback) {
        var i, m, buffer, appendLevel, parsed = [];

        appendLevel = function(err, data) {
            parsed[this] = new LevelData(data);
            if (this + 1 === m) {
                callback(parsed);
            }
        };

        for (i = 0, m = levels.length; i < m; i++) {
            buffer = new Buffer(levels[i], 'base64');
            png.parse(buffer, appendLevel.bind(i));
        }
    },

    /**
     * @return {EventEmitter}
     */
    setupPubSub: function() {
        var emitter, tick;

        emitter = new nodeEvents.EventEmitter();
        emitter.setMaxListeners(0);

        // Tick every N ms
        this._time = +new Date();
        setInterval(function() {
            emitter.emit('tick', +new Date() - this._time);
            this._time = +new Date();
        }.bind(this), 50);

        return emitter;
    },

    /**
     * @param {number} port
     */
    listen: function(port) {
        var server, xssnake;

        server = http.createServer();
        server.listen(port, '0.0.0.0');

        xssnake = sockjs.createServer();
        xssnake.on('connection', function(connection) {
            var client;
            client = new Client(connection);
            client.eventHandler = new EventHandler(client, this.pubsub);
        }.bind(this));

        xssnake.installHandlers(server, {prefix: '/xssnake', log: Util.dummy});

        this._server = server;
    }

};
