'use strict';

/**
 * Client-Server communication
 * @constructor
 * @extends {xss.room.Player}
 */
xss.room.ClientPlayer = function() {
    xss.room.Player.call(this);
    this.snake = null;
    this.local = false;
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
