'use strict';

/**
 * Client-Server communication
 * @param {string=} name;
 * @constructor
 * @extends {xss.room.Player}
 */
xss.room.ClientPlayer = function(name) {
    xss.room.Player.call(this);
    /** @type {xss.game.ClientSnake} */
    this.snake = null;
    this.local = false;
    this.name = name || '';
};

xss.util.extend(xss.room.ClientPlayer.prototype, xss.room.Player.prototype);
xss.util.extend(xss.room.ClientPlayer.prototype, {

    /**
     * @param {number} index
     * @param {xss.level.Level} level
     * @return {xss.game.ClientSnake}
     */
    setSnake: function(index, level) {
        this.snake = new xss.game.ClientSnake(
            index, this.local, this.name, level
        );
    },

    unsetSnake: function() {
        if (this.snake) {
            this.snake.destruct();
        }
    }

});
