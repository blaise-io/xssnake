'use strict';

/**
 * @param {xss.room.ServerPlayerRegistry} players
 * @param {xss.room.Options} options
 * @constructor
 */
xss.room.ServerRoundManager = function(players, options) {
    this.players = players;
    this.options = options;

    /** @type {Array.<number>} */
    this.levelHistory = [];

    this.round = new xss.room.ServerRound(players, options, this.levelHistory);
};

xss.room.ServerRoundManager.prototype = {

    

};
