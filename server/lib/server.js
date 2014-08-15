'use strict';

var WebSocketServer = require('ws').Server;
var events = require('events');


/**
 * @constructor
 */
xss.Server = function() {
    this.pubsub = this.setupPubSub();
    this.roomManager = new xss.room.RoomManager(this);
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

        pubsub = new events.EventEmitter();
        pubsub.setMaxListeners(0);

        // Tick every N ms
        this._time = new Date();
        setInterval(function() {
            pubsub.emit(xss.SERVER_TICK, new Date() - this._time);
            this._time = new Date();
        }.bind(this), 50);

        return pubsub;
    },

    /**
     * @param {number} port
     */
    listen: function(port) {
        var server;

        server = new WebSocketServer({port: xss.SERVER_PORT});
        server.on('connection', function(connection) {
            new xss.Client(this.pubsub, connection);
        }.bind(this));

        this._server = server;
    }

};
