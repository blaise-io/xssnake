/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var Game = require('./game.js');
var CONST = require('../shared/const.js');

/**
 * @param {Room} room
 * @param {number} levelID
 * @constructor
 */
function Round(room, levelID) {
    this.room = room;
    this.game = new Game(this, levelID);
}

module.exports = Round;

Round.prototype = {

    beingEnded: false,

    _countDownTimer: null,

    destruct: function() {
        clearTimeout(this._countDownTimer);
        this.room = null;
        this.game.destruct();
    },

    countdown: function() {
        this.room.emit(CONST.EVENT_GAME_COUNTDOWN);
        this.game.spawnSnakes();
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
