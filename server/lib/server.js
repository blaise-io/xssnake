'use strict';

var WebSocketServer = require('ws').Server;

/**
 * @constructor
 */
xss.Server = function() {
    this.emitter = new xss.EventEmitter();
    this.roomManager = new xss.room.RoomManager(this);
    this.start();
};

xss.Server.prototype = {

    destruct: function() {
        this.ws.close();
    },

    start: function() {
        this.ws = new WebSocketServer({
            host: xss.SERVER_HOST,
            port: xss.SERVER_PORT,
            path: xss.SERVER_PATH
        });
        this.ws.on('connection', function(connection) {
            new xss.Client(this.emitter, connection);
        }.bind(this));
    }

};
