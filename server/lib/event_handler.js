/*jshint globalstrict:true,es5:true*/
'use strict';

/**
 * @param {Object} server
 * @param {Client} client
 * @param {Object} socket
 * @constructor
 */
function EventHandler(server, client, socket) {
    this.server = server;
    this.client = client;
    this.socket = socket;

    client.emit('/c/connect', client.id);

    socket.on('disconnect', this.disconnect.bind(this));
    socket.on('/s/room', this.getRoom.bind(this));
    socket.on('/s/chat', this.chat.bind(this));
    socket.on('/s/up', this.update.bind(this));
}

module.exports = EventHandler;

EventHandler.prototype = {

    disconnect: function() {
        var room, client = this.client, server = this.server;

        room = server.roomManager.rooms[client.roomid];
        if (room) {
            room.leave(client);
        }

        server.state.removeClient(client);
    },

    getRoom: function(data) {
        var room, client = this.client, server = this.server;

        room = server.roomManager.getPreferredRoom(data);
        room.join(client);

        client.name = data.name;

        if (room.full()) {
            room.start();
        }
    },

    chat: function() {
    },

    update: function(data) {
        if (this.client.roomid) {
            var room = this.server.roomManager.get(this.client.roomid);
            room.broadcast('/c/up', {
                index: room.index(this.client),
                data: data
            }, this.client);
        }
    }

};