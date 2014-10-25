'use strict';

/**
 * @constructor
 * @param {xss.room.PlayerRegistry} players
 * @param {xss.room.Options} options
 * @extends {xss.room.Round}
 */
xss.room.ClientRound = function(players, options) {
    xss.room.Round.apply(this, arguments);
    /** @type {xss.game.ClientGame} */
    this.game = null;
    this.bindEvents();
};

xss.util.extend(xss.room.ClientRound.prototype, xss.room.Round.prototype);
xss.util.extend(xss.room.ClientRound.prototype, {

    bindEvents: function() {
        xss.event.on(xss.NC_ROOM_PLAYERS_SERIALIZE, xss.NS_ROUND, this.updatePlayers.bind(this));
        xss.event.on(xss.NC_ROOM_ROUND_SERIALIZE, xss.NS_ROUND, this.updateRound.bind(this));
    },

    unbindEvents: function() {
        xss.event.off(xss.NC_ROOM_PLAYERS_SERIALIZE, xss.NS_ROUND);
        xss.event.off(xss.NC_ROOM_ROUND_SERIALIZE, xss.NS_ROUND);
    },

    updatePlayers: function() {
        if (this.levelset && this.level) {
            this.updateGame();
        }
    },

    updateRound: function(serialized) {
        this.deserialize(serialized);
        this.updateGame();
    },

    updateGame: function() {
        this.levelset = xss.levelSetRegistry.getLevelset(this.levelsetIndex);
        this.level = this.levelset.getLevel(this.levelIndex);
        this.game = new xss.game.ClientGame(this.players, this.level);
    }

});
