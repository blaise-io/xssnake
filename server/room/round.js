'use strict';

/**
 * @param {xss.room.Room} room
 * @param {number} levelIndex
 * @constructor
 */
xss.room.Round = function(room, levelIndex) {
    this.room = room;
    this.game = new xss.game.Game(this, levelIndex);

    this.beingEnded = false;
    this._countDownTimer = 0;
};

xss.room.Round.prototype = {

    destruct: function() {
        clearTimeout(this._countDownTimer);
        this.game.destruct();
        this.room = null;
        this.game = null;
    },

    countdown: function() {
        this.room.emit(xss.EVENT_ROUND_COUNTDOWN);
        this._countDownTimer = setTimeout(
            this.start.bind(this),
            xss.TIME_ROUND_COUNTDOWN * 1000
        );
    },

    start: function() {
        this.room.emit(xss.EVENT_ROUND_START);
        this.game.start();
    },

    /**
     * @return {number}
     */
    numCrashed: function() {
        var crashed = 0, snakes = this.game.snakes;
        for (var i = 0, m = snakes.length; i < m; i++) {
            if (snakes[i].crashed) {
                crashed++;
            }
        }
        return crashed;
    },

    /**
     * @return {boolean}
     */
    allCrashed: function() {
        return (this.numCrashed() === this.room.clients.length);
    },

    /**
     * @return {boolean}
     */
    hasEnded: function() {
        return (this.numCrashed() + 1 >= this.room.clients.length);
    },

    /**
     * @param {xss.netcode.Client} client
     */
    removeClient: function(client) {
        this.game.removeClient(client);
    }

};
