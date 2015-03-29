'use strict';

/**
 * @param {xss.room.ClientPlayerRegistry} players
 * @constructor
 */
xss.room.Scoreboard = function(players) {
    this.players = players;
    this.ui = new xss.ui.Scoreboard(players);
    this.bindEvents();
};

xss.room.Scoreboard.prototype = {

    destruct: function() {
        this.players = null;
        this.ui.destruct();
        this.ui = null;
        this.unbindEvents();
    },

    bindEvents: function() {
        xss.event.on(
            xss.NC_PLAYERS_SERIALIZE,
            xss.NS_SCORE,
            this.ui.debounceUpdate.bind(this.ui)
        );
        xss.event.on(
            xss.NC_SCORE_UPDATE,
            xss.NS_SCORE,
            this.updatePlayerScores.bind(this)
        );
    },

    unbindEvents: function() {
        xss.event.off(xss.NC_PLAYERS_SERIALIZE, xss.NS_SCORE);
        xss.event.off(xss.NC_SCORE_UPDATE, xss.NS_SCORE);
    },

    updatePlayerScores: function(scoreArray) {
        this.players.setScores(scoreArray);
        this.ui.debounceUpdate();
    }

};
