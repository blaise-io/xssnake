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
                this.setSnake(i, players.names[i], i === players.local)
            );
        }
    },

    setSnake: function(i, name, local) {
        var snake = new xss.game.ClientSnake(i, local, name, this.level);
        if (local) {
            this.localSnake = snake;
        }
        return this.snake;
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
            if (this.snakes[i].isTimeForMove(delta, shift)) {
                this.snakes[i].handleNextMove(this.snakes);
            }
        }
    }
};
