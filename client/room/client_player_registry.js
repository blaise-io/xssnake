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

xss.util.extend(xss.room.ClientPlayerRegistry.prototype, xss.room.PlayerRegistry.prototype);
xss.util.extend(xss.room.ClientPlayerRegistry.prototype, {

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
        this.destruct();
        for (var i = 0, m = serializedPlayers.length; i < m; i++) {
            this.deserializePlayer(serializedPlayers[i]);
        }
    },

    /**
     * @param {Array} serialized
     */
    deserializePlayer: function(serialized) {
        var player = new xss.room.ClientPlayer();
        player.deserialize(serialized);

        if (player.local) {
            xss.player.deserialize(serialized);
            this.localPlayer = xss.player;
            this.add(xss.player);
        } else {
            this.add(player);
        }
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
     * @return {Array.<number>}
     */
    getScore: function() {
        var scores = [];
        for (var i = 0, m = this.players.length; i < m; i++) {
            scores.push(this.players[i].score);
        }
        return scores;
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

    moveSnakes: function(delta, shift) {
        for (var i = 0, m = this.players.length; i < m; i++) {
            this.players[i].snake.handleNextMove(delta, shift, this.players);
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
     * @param {xss.room.ClientPlayerRegistry} missingPlayerRegistry
     * @return {xss.room.Player}
     */
    getQuit: function(missingPlayerRegistry) {
        for (var i = 0, m = this.players.length; i < m; i++) {
            if (-1 === missingPlayerRegistry.players.indexOf(this.players[i])) {
                return this.players[i];
            }
        }
        return null;
    },

    /**
     * @param {xss.room.ClientPlayerRegistry} includingPlayerRegistery
     * @return {xss.room.Player}
     */
    getJoin: function(includingPlayerRegistery) {
        for (var i = 0, m = includingPlayerRegistery.players.length; i < m; i++) {
            if (-1 === this.players.indexOf(includingPlayerRegistery.players[i])) {
                return includingPlayerRegistery.players[i];
            }
        }
        return null;
    },

    /**
     * @return {xss.room.Player}
     */
    localPlayerIsHost: function() {
        return Boolean(
            this.localPlayer && xss.player &&
            this.localPlayer === xss.player &&
            0 === this.players.indexOf(xss.player)
        );
    }

});
