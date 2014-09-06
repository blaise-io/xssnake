'use strict';

var events = require('events');
var WebSocketServer = require('ws').Server;

/**
 * @constructor
 */
xss.netcode.Server = function() {
    this.emitter = new events.EventEmitter();
    this.roomManager = new xss.room.RoomManager(this);
    this.ws = this.start();
};

xss.netcode.Server.prototype = {

    destruct: function() {
        this.roomManager.destruct();
        this.ws.close();
    },

    start: function() {
        var ws = new WebSocketServer({
            host: xss.SERVER_HOST,
            port: xss.SERVER_PORT,
            path: xss.SERVER_PATH
        });

        ws.on('connection', function(connection) {
            new xss.room.Player(this, connection);
        }.bind(this));

        return ws;
    }

};
