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

    this.levelPlayset = new xss.LevelPlayset(options.levelset);
    this.round = new xss.room.ServerRound(roomEmitter, players, options, this.levelPlayset);
    this.score = new xss.game.ServerScore(players);
    this.roundIndex = 0;

    this.bindEvents();
};

xss.room.ServerRoundSet.prototype = {

    destruct: function() {
        this.roomEmitter.removeAllListeners(xss.SE_PLAYER_COLLISION);
        clearTimeout(this.nextRoundTimeout);

        this.levelPlayset.destruct();
        this.levelPlayset = null;

        this.round.destruct();
        this.round = null;

        this.score.destruct();
        this.score = null;

        this.players = null;
        this.options = null;
    },

    bindEvents: function() {
        this.roomEmitter.on(xss.SE_PLAYER_COLLISION, this.handleCollisions.bind(this));
    },

    /**
     * @param {xss.room.ServerPlayer} winner
     */
    switchRounds: function(winner) {
        var delay = winner ? xss.SECONDS_ROUND_GLOAT : xss.SECONDS_ROUND_PAUSE;
        if (this.hasSetWinner()) {
            // TODO
        } else if (!this.round.wrappingUp) {
            this.round.wrapUp(winner);
            this.nextRoundTimeout = setTimeout(
                this.startNewRound.bind(this), delay * 1000
            );
        }
    },

    startNewRound: function() {
        this.round.destruct();
        this.round = new xss.room.ServerRound(
            this.roomEmitter, this.players, this.options, this.levelPlayset
        );
        this.round.emitAll();
        this.players.removeDisconnectedPlayers();
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
