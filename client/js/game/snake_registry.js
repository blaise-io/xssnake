'use strict';

/**
 * @param {Array.<xss.level.Spawn>} spawns
 * @constructor
 */
xss.game.SnakeRegistry = function(spawns) {
    this.spawns = spawns;
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
        var snake = new xss.game.ClientSnake(i, local, name, this.spawns[i]);
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
    }
};
