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
        this.hideMeta();
        this.localPlayer = null;
        xss.room.ClientPlayerRegistry.destruct.call(this);
    },

    /**
     * @param {Array} serialized
     */
    deserialize: function(serialized) {
        var player;
        this.players.length = 0;
        for (var i = 0, m = serialized.length; i < m; i++) {
            player = new xss.room.ClientPlayer();
            player.deserialize(serialized[i]);
            this.add(player);
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
