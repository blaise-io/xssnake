/*jshint globalstrict:true*/
'use strict';

var Room = require('./room.js');

/**
 * @constructor
 */
function RoomManager(server) {
    this.server = server;
    this.curid = 0;
    this.rooms = {};
}

module.exports = RoomManager;

RoomManager.prototype = {

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
        id = 'R' + this.curid++;
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
        var friendlyMatch, full;

        friendlyMatch = room.friendly === filter.friendly;
        full = room.full();

        return (room.pub && friendlyMatch && !full);
    }

};