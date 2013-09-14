'use strict';

var CONST = require('../shared/const.js');
var Game = require('./game.js');

/**
 * @param {Room} room
 * @param {number} levelIndex
 * @constructor
 */
function Round(room, levelIndex) {
    this.room = room;
    this.game = new Game(this, levelIndex);

    this.beingEnded = false;
    this._countDownTimer = 0;
}

module.exports = Round;

Round.prototype = {

    destruct: function() {
        clearTimeout(this._countDownTimer);
        this.game.destruct();
        this.room = null;
        this.game = null;
    },

    countdown: function() {
        this.room.emit(CONST.EVENT_GAME_COUNTDOWN);
        this._countDownTimer = setTimeout(
            this.start.bind(this),
            CONST.TIME_ROUND_COUNTDOWN * 1000
        );
    },

    start: function() {
        this.room.emit(CONST.EVENT_GAME_START);
        this.game.start();
    },

    /**
     * @returns {number}
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
     * @returns {boolean}
     */
    allCrashed: function() {
        return (this.numCrashed() === this.room.clients.length);
    },

    /**
     * @returns {boolean}
     */
    hasEnded: function() {
        return (this.numCrashed() + 1 >= this.room.clients.length);
    },

    /**
     * @param {Client} client
     */
    removeClient: function(client) {
        this.game.removeClient(client);
    }

};
