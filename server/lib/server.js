'use strict';

var http = require('http');
var png = require('pngparse');
var sockjs = require('sockjs');
var nodeEvents = require('events');


/**
 * @constructor
 */
xss.Server = function() {
    this.pubsub = this.setupPubSub();
    this.roomManager = new xss.RoomManager(this);
    this._server = null;
};

xss.Server.prototype = {

    destruct: function() {
        if (this._server) {
            this._server.close();
        }
    },

    /**
     * @param {Array.<xss.LevelData>} levels
     * @param {number=} port
     */
    start: function(levels, port) {
        this.port = port || xss.SERVER_PORT;
        this.levels = levels;
        this.listen(this.port);
    },

    /**
     * @param {function(Array.<xss.LevelData>)} callback
     */
    preloadLevels: function(callback) {
        var i, m, buffer, appendLevel, parsed = [];

        appendLevel = function(err, data) {
            parsed[this] = new xss.LevelData(data);
            if (this + 1 === m) {
                callback(parsed);
            }
        };

        for (i = 0, m = xss.data.levels.length; i < m; i++) {
            buffer = new Buffer(xss.data.levels[i][0], 'base64');
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
            client = new xss.Client(connection);
            client.eventHandler = new xss.EventHandler(client, this.pubsub);
        }.bind(this));

        xssnake.installHandlers(server, {prefix: '/xssnake', log: xss.util.dummy});

        this._server = server;
    }

};
