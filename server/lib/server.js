'use strict';

var http = require('http');
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
     * @param {number=} port
     */
    start: function(port) {
        this.port = port || xss.SERVER_PORT;
        this.listen(this.port);
    },

    /**
     * @return {EventEmitter}
     */
    setupPubSub: function() {
        var pubsub;

        pubsub = new nodeEvents.EventEmitter();
        pubsub.setMaxListeners(0);

        // Tick every N ms
        this._time = +new Date();
        setInterval(function() {
            pubsub.emit('tick', +new Date() - this._time);
            this._time = +new Date();
        }.bind(this), 50);

        return pubsub;
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
            new xss.Client(this.pubsub, connection);
        }.bind(this));

        xssnake.installHandlers(server, {prefix: '/xssnake', log: xss.util.noop});

        this._server = server;
    }

};
