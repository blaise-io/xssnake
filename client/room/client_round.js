'use strict';

/**
 * @constructor
 * @param {xss.room.PlayerRegistry} players
 * @param {xss.room.Options} options
 * @extends {xss.room.Round}
 */
xss.room.ClientRound = function(players, options) {
    xss.room.Round.call(this, players, options);
    this.level = new xss.levels.BlankLevel(new xss.levelset.Config());
    this.game = new xss.game.ClientGame(this.players, this.level);
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

    getLevel: function() {
        var levelset = xss.levelSetRegistry.getLevelset(this.levelsetIndex);
        return levelset.getLevel(this.levelIndex);
    },

    updatePlayers: function(serializedPlayers) {
        this.players.deserialize(serializedPlayers);
        this.game.updatePlayers(this.players);
    },

    updateRound: function(serializedRound) {
        this.deserialize(serializedRound);
        this.level = this.getLevel();
        this.game.updateLevel(this.level);
    }

});
