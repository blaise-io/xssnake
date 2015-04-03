'use strict';

/**
 * @constructor
 * @extends {xss.room.PlayerRegistry}
 */
xss.room.ClientPlayerRegistry = function() {
    xss.room.PlayerRegistry.call(this);
    /** @type {xss.room.Player} */
    this.localPlayer = null;
};

xss.extend(xss.room.ClientPlayerRegistry.prototype, xss.room.PlayerRegistry.prototype);
xss.extend(xss.room.ClientPlayerRegistry.prototype, /** @lends {xss.room.ClientPlayerRegistry.prototype} */ {

    destruct: function() {
        this.localPlayer = null;
        xss.room.PlayerRegistry.prototype.destruct.call(this);
    },

    /**
     * @param {xss.room.ClientPlayerRegistry} playerRegistry
     */
    clone: function(playerRegistry) {
        this.players = playerRegistry.players.slice();
        this.localPlayer = playerRegistry.localPlayer;
    },

    /**
     * @param {Array.<Array>} serializedPlayers
     */
    deserialize: function(serializedPlayers) {
        for (var i = 0, m = serializedPlayers.length; i < m; i++) {
            this.players[i].deserialize(serializedPlayers[i]);
        }
    },

    /**
     * @param {Array.<Array>} serializedPlayers
     */
    reconstruct: function(serializedPlayers) {
        this.destruct();
        for (var i = 0, m = serializedPlayers.length; i < m; i++) {
            this.reconstructPlayer(serializedPlayers[i]);
        }
    },

    /**
     * @param {Array} serialized
     */
    reconstructPlayer: function(serialized) {
        var player = new xss.room.ClientPlayer();
        player.deserialize(serialized);

        if (player.local) {
            xss.player.deserialize(serialized);
            player = this.localPlayer = xss.player;
        }

        this.add(player);
    },

    /**
     * @return {Array.<string>}
     */
    getNames: function() {
        var names = [];
        for (var i = 0, m = this.players.length; i < m; i++) {
            names.push(this.players[i].name);
        }
        return names;
    },

    /**
     * @param {Array.<number>} scores
     */
    setScores: function(scores) {
        for (var i = 0, m = scores.length; i < m; i++) {
            this.players[i].score = scores[i];
        }
    },

    /**
     * @param {xss.level.Level} level
     */
    setSnakes: function(level) {
        for (var i = 0, m = this.players.length; i < m; i++) {
            this.players[i].setSnake(i, level);
        }
    },

    unsetSnakes: function() {
        // There may still be a few shapes lingering around.
        this.clearSnakeShapes();
        for (var i = 0, m = this.players.length; i < m; i++) {
            this.players[i].unsetSnake();
        }
    },

    clearSnakeShapes: function() {
        var keys = Object.keys(xss.shapes);
        for (var i = 0, m = keys.length; i < m; i++) {
            if (keys[i].substr(0, xss.NS_SNAKE.length) === xss.NS_SNAKE) {
                xss.shapes[keys[i]] = null;
            }
        }
    },

    /**
     * @param {xss.level.Level} level
     * @param {number} elapsed
     * @param {xss.Shift} shift
     */
    moveSnakes: function(level, elapsed, shift) {
        for (var i = 0, m = this.players.length; i < m; i++) {
            this.players[i].snake.handleNextMove(level, elapsed, shift, this.players);
            this.players[i].snake.shiftParts(shift);
        }
    },

    showMeta: function() {
        for (var i = 0, m = this.players.length; i < m; i++) {
            this.players[i].snake.showName();
        }
        if (this.localPlayer) {
            this.localPlayer.snake.showDirection();
        }
    },

    hideMeta: function() {
        for (var i = 0, m = this.players.length; i < m; i++) {
            this.players[i].snake.removeNameAndDirection();
        }
    },

    addControls: function() {
        if (this.localPlayer) {
            this.localPlayer.snake.addControls();
        }
    },

    /**
     * @param {xss.room.ClientPlayerRegistry} prevPlayers
     * @return {string|null}
     */
    getQuitName: function(prevPlayers) {
        var prevNames, newNames;
        prevNames = prevPlayers.getNames();
        newNames = this.getNames();

        for (var i = 0, m = prevNames.length; i < m; i++) {
            if (-1 === newNames.indexOf(prevNames[i])) {
                return prevNames[i];
            }
        }

        return null;
    },

    /**
     * Assume last player that joined to be last item in players array.
     * @return {string|null}
     */
    getJoinName: function() {
        if (this.getTotal()) {
            return this.players[this.players.length - 1].name;
        }
        return null;
    },

    /**
     * @return {boolean}
     */
    localPlayerIsHost: function() {
        return Boolean(
            this.localPlayer && xss.player &&
            this.localPlayer === xss.player &&
            0 === this.players.indexOf(xss.player)
        );
    }

});
