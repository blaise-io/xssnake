'use strict';

/**
 * @param {xss.room.ClientPlayerRegistry} players
 * @param {xss.room.ClientOptions} options
 * @constructor
 */
xss.room.ClientRoundSet = function(players, options) {
    this.players = players;
    this.options = options;
    /** @typedef {xss.room.ClientRound} */
    this.round = null;
    this.bindEvents();
};

xss.room.ClientRoundSet.prototype = {

    destruct: function() {
        this.players = null;
        this.options = null;
        this.round.destruct();
    },

    bindEvents: function() {
        xss.event.on(xss.NC_ROUND_SERIALIZE, xss.NS_ROUND_SET, this.updateRound.bind(this));
    },

    unbindEvents: function() {
        xss.event.off(xss.NC_ROUND_SERIALIZE, xss.NS_ROUND_SET);
    },

    setupRound: function() {
        this.round = new xss.room.ClientRound(this.players, this.options);
    },

    updateRound: function(serializedRound) {
        console.log(this.round.hasStarted());
        if (this.round.hasStarted()) {
            console.log('Create new round');
            this.round.destruct();
            this.round = new xss.room.ClientRound(this.players, this.options);
            this.round.updateRound(serializedRound);
        }
    }

};
