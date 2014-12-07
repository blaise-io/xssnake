'use strict';

/**
 * @param {xss.room.ServerPlayerRegistry} players
 * @param {xss.room.Options} options
 * @param {Array.<number>} levelsPlayed
 * @constructor
 * @extends {xss.room.Round}
 */
xss.room.ServerRound = function(players, options, levelsPlayed) {
    xss.room.Round.call(this, players, options);
    this.levelsetIndex = options.levelset;
    this.levelset = xss.levelsetRegistry.getLevelset(this.levelsetIndex);
    this.levelIndex = this.levelset.getRandomLevelIndex(levelsPlayed);

    this.countdownStarted = false;
    this.countdownCancelable = true;
};

xss.util.extend(xss.room.ServerRound.prototype, xss.room.Round.prototype);

xss.util.extend(xss.room.ServerRound.prototype, {

    destruct: function() {
        clearTimeout(this.countdownTimer);
        this.unbindEvents();
    },

    bindEvents: function() {
        this.roomEmitter.on(xss.SE_PLAYER_DISCONNECT, this.handleDisconnect);
    },

    unbindEvents: function() {
        this.roomEmitter.off(xss.SE_PLAYER_DISCONNECT);
    },

    /**
     * @param {xss.room.ServerPlayer} player
     */
    emit: function(player) {
        player.emit(xss.NC_ROUND_SERIALIZE, this.serialize());
    },

    /**
     * @param {boolean} enabled
     */
    toggleCountdown: function(enabled) {
        this.countdownStarted = enabled;
        this.players.emit(xss.NC_ROUND_COUNTDOWN, [+enabled]);
        this.countdownTimer = setTimeout(
            this.startRound.bind(this),
            xss.TIME_ROUND_COUNTDOWN * 1000
        );
    },

    startRound: function() {
        this.players.emit(xss.NC_ROUND_START);
    },

    handleDisconnect: function() {
        if (this.countdownStarted && this.countdownCancelable) {
            this.toggleCountdown(false);
        }
    }

});
