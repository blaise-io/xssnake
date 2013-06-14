/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var CONST = require('../shared/const.js');

/**
 * @param {Room} room
 * @constructor
 */
function Score(room) {
    this.room = room;
    this.points = [];
}

module.exports = Score;

Score.prototype = {

    destruct: function() {
        this.room = null;
        this.points = [];
    },

    /**
     * @param {Client} client
     */
    addClient: function(client) {
        this.points[client.index] = 0;
    },

    /**
     * @param {Client} client
     */
    removeClient: function(client) {
        this.points.splice(client.index, 1);
    },

    /**
     * @returns {Client}
     */
    getWinner: function() {
        var sorted, last, index;

        sorted = this.points.slice().sort();
        last = sorted.length - 1;
        index = this.points.indexOf(sorted[last]);

        return (sorted[last] - CONST.ROOM_WIN_BY_MIN >= sorted[last - 1]) ?
            this.room.clients[index] : null;
    },

    /**
     * @param {Room} room
     */
    dealKnockoutPoints: function(room) {
        var clients = room.clients;
        for (var i = 0, m = clients.length; i < m; i++) {
            if (!clients[i].snake.crashed) {
                this.points[i] += 2;
                room.buffer(CONST.EVENT_SCORE_UPDATE, [i, this.points[i]]);
            }
        }
        room.flush();
    },

    /**
     * @param {Client} client
     */
    dealApplePoints: function(client) {
        var points = ++this.points[client.index];
        this.room.buffer(
            CONST.EVENT_SCORE_UPDATE, [client.index, points]
        );
    },

    /**
     * @param {Client} client
     * @return {number}
     */
    rank: function(client) {
        var clientPoints, points = this.points, position = 0;

        if (points.length === 1) {
            return CONST.SCORE_NEUTRAL;
        }

        clientPoints = points[client.index];
        for (var i = 0, m = points.length; i < m; i++) {
            if (clientPoints > points[i]) {
                position++;
            } else if (clientPoints < points[i]) {
                position--;
            }
        }

        if (position === 0) {
            return CONST.SCORE_NEUTRAL;
        } else {
            return position > 0 ? CONST.SCORE_LEADING : CONST.SCORE_BEHIND;
        }
    }
};
