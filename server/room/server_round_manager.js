'use strict';

/**
 * @param {EventEmitter} roomEmitter
 * @param {xss.room.ServerPlayerRegistry} players
 * @param {xss.room.Options} options
 * @constructor
 */
xss.room.ServerRoundManager = function(roomEmitter, players, options) {
    this.roomEmitter = roomEmitter;
    this.players = players;
    this.options = options;

    /** @type {Array.<number>} */
    this.levelHistory = [];

    this.round = new xss.room.ServerRound(roomEmitter, players, options, this.levelHistory);
    this.roundIndex = 0;
};

xss.room.ServerRoundManager.prototype = {

    destruct: function() {
        this.round.destruct();
        this.players = null;
        this.options = null;
        this.round = null;
    },

    hasStarted: function() {
        return (this.roundIndex >= 1 || this.round.started);
    },

    detectAutostart: function(full) {
        if (full && 0 === this.roundIndex) {
            this.round.toggleCountdown(true);
        }
    }

};
