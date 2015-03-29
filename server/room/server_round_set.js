'use strict';

/**
 * A set of rounds.
 * After N rounds, the player with most points wins.
 *
 * @param {EventEmitter} roomEmitter
 * @param {xss.room.ServerPlayerRegistry} players
 * @param {xss.room.Options} options
 * @constructor
 */
xss.room.ServerRoundSet = function(roomEmitter, players, options) {
    this.roomEmitter = roomEmitter;
    this.players = players;
    this.options = options;

    /** @type {Array.<number>} */
    this.levelHistory = [];

    this.round = new xss.room.ServerRound(roomEmitter, players, options, this.levelHistory);
    this.score = new xss.game.ServerScore(players);
    this.roundIndex = 0;

    this.bindEvents();
};

xss.room.ServerRoundSet.prototype = {

    destruct: function() {
        this.roomEmitter.removeAllListeners(xss.SE_PLAYER_COLLISION);
        clearTimeout(this.nextRoundTimeout);
        this.round.destruct();
        this.score.destruct();
        this.players = null;
        this.options = null;
        this.round = null;
    },

    bindEvents: function() {
        this.roomEmitter.on(xss.SE_PLAYER_COLLISION, this.handleCollisions.bind(this));
    },

    /**
     * @param {xss.room.ServerPlayer} winner
     */
    switchRounds: function(winner) {
        var delay = winner ? xss.TIME_ROUND_GLOAT : xss.TIME_ROUND_PAUSE;
        if (this.hasSetWinner()) {
            // TODO
        } else if (!this.round.wrappingUp) {
            this.round.wrapUp(winner);
            this.nextRoundTimeout = setTimeout(this.startNewRound.bind(this), delay);
        }
    },

    startNewRound: function() {
        this.round.destruct();
        this.players.removeDisconnectedPlayers();
        this.round = new xss.room.ServerRound(
            this.roomEmitter, this.players, this.options, this.levelHistory
        );
        this.round.emitAll();
        this.round.toggleCountdown(true);
    },

    hasSetWinner: function() {
        return false;
    },

    handleCollisions: function(crashingPlayers) {
        var alive = this.round.getAlivePlayers();
        this.score.update(crashingPlayers, this.round.level);
        if (alive.length <= 1) {
            this.switchRounds(alive[0] || null);
        }
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
