'use strict';

var WebSocketServer = require('ws').Server;
var events = require('events');


/**
 * @constructor
 */
xss.Server = function() {
    this.port = xss.SERVER_PORT;
    this.pubsub = this.setupPubSub();
    this.roomManager = new xss.room.RoomManager(this);
};

xss.Server.prototype = {

    destruct: function() {
        if (this._server) {
            this._server.close();
        }
    },

    start: function() {
        this._server = new WebSocketServer({port: this.port});
        this._server.on('connection', function(connection) {
            new xss.Client(this.pubsub, connection);
        }.bind(this));
    },

    /**
     * @return {nodeEvents.EventEmitter}
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
    }

};
