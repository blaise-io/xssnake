'use strict';

/**
 * @param {xss.level.Level} level
 * @constructor
 */
xss.game.SnakeRegistry = function(level) {
    this.level = level;
    this.spawns = level.data.spawns;

    /** @type {Array.<xss.game.ClientSnake>} */
    this.snakes = [];
    /** @type {xss.game.ClientSnake} */
    this.localSnake = null;
};

xss.game.SnakeRegistry.prototype = {

    /**
     * @param {xss.room.PlayerRegistry} players
     */
    setSnakes: function(players) {
        for (var i = 0, m = players.names.length; i < m; i++) {
            this.snakes.push(
                this.setSnake(i, i === players.local, players.names[i])
            );
        }
    },

    /**
     * @param {number} index
     * @param {boolean} local
     * @param {string} name
     * @return {xss.game.ClientSnake}
     */
    setSnake: function(index, local, name) {
        var snake = new xss.game.ClientSnake(index, local, name, this.level);
        if (local) {
            this.localSnake = snake;
        }
        return snake;
    },

    showMeta: function() {
        for (var i = 0, m = this.snakes.length; i < m; i++) {
            this.snakes[i].showName();
        }
        if (this.localSnake) {
            this.localSnake.showDirection();
        }
    },

    removeMeta: function() {
        for (var i = 0, m = this.snakes.length; i < m; i++) {
            this.snakes[i].removeNameAndDirection();
        }
    },

    addControls: function() {
        if (this.localSnake) {
            this.localSnake.addControls();
        }
    },

    move: function(delta, shift) {
        for (var i = 0, m = this.snakes.length; i < m; i++) {
            this.snakes[i].handleNextMove(delta, shift, this.snakes);
            this.snakes[i].shiftParts(shift);
        }
    }
};
