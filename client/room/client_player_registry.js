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
        this.add(player);
        if (player.local) {
            this.localPlayer = player;
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
    }

});
