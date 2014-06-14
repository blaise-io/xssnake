'use strict';

/**
 * @param {xss.Room} room
 * @param {number} levelIndex
 * @constructor
 */
xss.Round = function(room, levelIndex) {
    this.room = room;
    this.game = new xss.Game(this, levelIndex);

    this.beingEnded = false;
    this._countDownTimer = 0;
};

xss.Round.prototype = {

    destruct: function() {
        clearTimeout(this._countDownTimer);
        this.game.destruct();
        this.room = null;
        this.game = null;
    },

    countdown: function() {
        this.room.emit(xss.EVENT_GAME_COUNTDOWN);
        this._countDownTimer = setTimeout(
            this.start.bind(this),
            xss.TIME_ROUND_COUNTDOWN * 1000
        );
    },

    start: function() {
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
     * @param {xss.Client} client
     */
    removeClient: function(client) {
        this.game.removeClient(client);
    }

};
