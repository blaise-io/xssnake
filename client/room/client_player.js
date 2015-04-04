'use strict';

/**
 * Client-Server communication
 * @param {string=} name
 * @constructor
 * @extends {xss.room.Player}
 */
xss.room.ClientPlayer = function(name) {
    xss.room.Player.apply(this, arguments);
    /** @type {xss.game.ClientSnake} */
    this.snake = null;
    this.local = false;
};

xss.extend(xss.room.ClientPlayer.prototype, xss.room.Player.prototype);
xss.extend(xss.room.ClientPlayer.prototype, /** @lends {xss.room.ClientPlayer.prototype} */ {

    /**
     * @param {Array} serialized
     */
    deserialize: function(serialized) {
        xss.room.Player.prototype.deserialize.apply(this, arguments);
        if (!this.connected && this.snake) {
            this.snake.setCrashed();
        }
    },

    /**
     * @param {number} index
     * @param {xss.level.Level} level
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
