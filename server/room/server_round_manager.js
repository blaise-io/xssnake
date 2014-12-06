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
    this.started = false;

    /** @type {Array.<number>} */
    this.levelHistory = [];

    this.round = new xss.room.ServerRound(players, options, this.levelHistory);
    this.roundIndex = 0;
};

xss.room.ServerRoundManager.prototype = {

    destruct: function() {
        this.round.destruct();
        this.players = null;
        this.options = null;
        this.round = null;
    },

    detectAutostart: function(full) {
        if (full && 0 === this.roundIndex) {
            this.round.toggleCountdown(true);
        }
    }

};
