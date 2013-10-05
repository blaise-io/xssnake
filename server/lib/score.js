'use strict';

/**
 * @param {xss.Room} room
 * @constructor
 */
xss.Score = function(room) {
    this.room = room;
    this.points = [];
    for (var i = 0, m = room.clients.length; i < m; i++) {
        this.points.push(0);
    }
};

xss.Score.prototype = {

    destruct: function() {
        this.room = null;
    },

    /**
     * @param {xss.Client} client
     */
    addClient: function(client) {
        this.points[client.index] = 0;
    },

    /**
     * @param {xss.Client} client
     */
    removeClient: function(client) {
        this.points.splice(client.index, 1);
    },

    /**
     * @returns {xss.Client}
     */
    getWinner: function() {
        var sorted, last, index;

        sorted = this.points.slice().sort();
        last = sorted.length - 1;
        index = this.points.indexOf(sorted[last]);

        return (sorted[last] - xss.ROOM_WIN_BY_MIN >= sorted[last - 1]) ?
            this.room.clients[index] : null;
    },

    /**
     * @param {xss.Room} room
     */
    emitKnockoutPoints: function(room) {
        var clients = room.clients;
        for (var i = 0, m = clients.length; i < m; i++) {
            if (!clients[i].snake.crashed) {
                this.points[i] += 2;
                room.buffer(xss.EVENT_SCORE_UPDATE, [i, this.points[i]]);
            }
        }
        room.flush();
    },

    /**
     * @param {xss.Client} client
     */
    bufferApplePoints: function(client) {
        var points = ++this.points[client.index];
        this.room.buffer(
            xss.EVENT_SCORE_UPDATE, [client.index, points]
        );
    },

    /**
     * @param {xss.Client} client
     * @return {number}
     */
    rank: function(client) {
        var clientPoints, points = this.points, position = 0;

        if (points.length === 1) {
            return xss.SCORE_NEUTRAL;
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
            return xss.SCORE_NEUTRAL;
        } else {
            return position > 0 ? xss.SCORE_LEADING : xss.SCORE_BEHIND;
        }
    }
};
