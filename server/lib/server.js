/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var http = require('http');
var png = require('pngparse');
var sockjs = require('sockjs');
var config = require('../shared/config.js');
var EventHandler = require('./event_handler.js');
var RoomManager = require('./room_manager.js');
var Client = require('./client.js');
var Ticker = require('./ticker.js');
var levels = require('../shared/levels.js');
var LevelParser = require('../shared/level_parser.js');


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
            parsed[this] = new LevelParser(data);
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

        this.ticker = new Ticker(50);
        this.ticker.setMaxListeners(0);
        this.roomManager = new RoomManager(this);
        this.listen(config.SERVER_PORT);

        console.log('XSSNAKE server is running...');
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
        client.eventHandler = new EventHandler(this, client, conn);
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
