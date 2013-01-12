/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var Room = require('./room.js');

/**
 * @constructor
 */
function RoomManager(server) {
    this.server = server;
    this.inc = 0;
    this.rooms = {};
}

module.exports = RoomManager;

RoomManager.prototype = {

    /**
     * @param {number} id
     * @return {Room}
     */
    room: function(id) {
        return this.rooms[id];
    },

    /**
     * @param {Room} room
     */
    remove: function(room) {
        delete this.rooms[room.id];
        room.destruct();
    },

    /**
     * @param {Object.<string, boolean>} filter
     * @return {Room}
     */
    getPreferredRoom: function(filter) {
        var room = this._findRoom(filter);
        if (!room) {
            room = this.createRoom(filter);
        }
        return room;
    },

    /**
     * @param {Object.<string, boolean>} filter
     * @return {Room}
     */
    createRoom: function(filter) {
        var id, room;
        id = ++this.inc;
        room = new Room(this.server, id, filter);
        this.rooms[room.id] = room;
        return room;
    },

    /**
     * @param {Object.<string, boolean>} filter
     * @return {?Room}
     * @private
     */
    _findRoom: function(filter) {
        for (var k in this.rooms) {
            if (this.rooms.hasOwnProperty(k)) {
                var room = this.rooms[k];
                if (this._isFilterMatch(filter, room)) {
                    return room;
                }
            }
        }
        return null;
    },

    /**
     * @param {Object.<string, boolean>} filter
     * @param {Room} room
     * @return {boolean}
     * @private
     */
    _isFilterMatch: function(filter, room) {
        var eqFriendly = room.friendly === filter.friendly;
        return (room.pub && eqFriendly && !room.isFull() && !room.inProgress);
    }

};