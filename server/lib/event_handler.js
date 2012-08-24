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
}

module.exports = EventHandler;

EventHandler.prototype = {

    disconnect: function() {
        var room, client = this.client, server = this.server;

        room = server.roomManager.rooms[client.roomid];
        if (room) {
            room.leave(client);
            room.emit('/c/notice', client.name + ' left');
        }

        server.state.removeClient(client);
    },

    getRoom: function(data) {
        var room, client = this.client, server = this.server;

        room = server.roomManager.getPreferredRoom(data);
        room.join(client);

        client.name = data.name;
        client.roomid = room.id;

        this.socket.join(room.id);

        if (room.full()) {
            room.emit('/c/notice', 'room is full');
            room.index();
        }

        room.emit('/c/notice', client.name + ' joined the room');
        room.emit('/c/notice', [room.capacity]);
        client.emit('/c/notice', 'your name is: ' + client.name);

        room.broadcast('/c/notice', client.name + ' joined', client);
    },

    chat: function() {
    }

};