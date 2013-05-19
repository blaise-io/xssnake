/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var http = require('http');
var png = require('pngparse');
var sockjs = require('sockjs');
var nodeEvents = require('events');
var config = require('../shared/config.js');
var RoomManager = require('./room_manager.js');
var Client = require('./client.js');
var levels = require('../shared/levels.js');
var LevelData = require('../shared/level_data.js');


/**
 * @constructor
 */
function Server() {
    this.preloadLevels(this.init.bind(this));
}

module.exports = Server;

Server.prototype = {

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

    init: function(levels) {
        this.levels = levels;

        /** @typedef {number} */
        this.inc = 0;
        /** @typedef {Object.<number, {Client}>} */
        this.clients = {};

        this.pubsub = this.setupPubSub();

        this.roomManager = new RoomManager(this);
        this.listen(config.SERVER_PORT);

        console.log('XSSNAKE server is running...');
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
        var xssnake, server;

        xssnake = sockjs.createServer();
        xssnake.on('connection', function(conn) {
            this.addClient(conn);
        }.bind(this));

        server = http.createServer();
        xssnake.installHandlers(server, {prefix: '/xssnake'});
        server.listen(port, '0.0.0.0');
    },

    /**
     * @param {Object} conn
     */
    addClient: function(conn) {
        var client, id = ++this.inc;
        client = new Client(id, this, conn);
        this.clients[id] = client;
    },

    /**
     * @param {Client} client
     */
    removeClient: function(client) {
        client.destruct();
        delete this.clients[client.id];
    }

};
