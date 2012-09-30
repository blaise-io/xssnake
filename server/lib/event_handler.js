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

    client.emit('/client/connect', client.id);

    socket.on('disconnect', this.disconnect.bind(this));
    socket.on('/server/room/match', this.getRoom.bind(this));
    socket.on('/server/chat/message', this.chat.bind(this));
    socket.on('/server/snake/update', this.update.bind(this));
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
        client.name = data.name;
        room = server.roomManager.getPreferredRoom(data);
        room.join(client);
    },

    chat: function() {
    },

    /**
     * @param data [<array>,<number>]
     */
    update: function(data) {
        if (this.client.roomid) {
            var room, snake, index, send;

            room = this.server.roomManager.get(this.client.roomid);

            snake = this.client.snake;
            snake.update(room, data[0], data[1]);

            index = room.clients.indexOf(this.client);
            send = [index, snake.parts, snake.direction];
            room.broadcast('/client/snake/update', send, this.client);
        }
    }

};