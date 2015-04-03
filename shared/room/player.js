'use strict';

/**
 * @param {string=} name
 * @constructor
 */
xss.room.Player = function(name) {
    /** @type {string} */
    this.name = name || '';
    this.connected = false;
    this.score = 0;
    /** @type {xss.game.Snake} */
    this.snake = null;
};

xss.room.Player.prototype = {

    /**
     * @param {boolean} local
     * @return {Array.<string|number>}
     */
    serialize: function(local) {
        return [
            this.name, (this.connected << 0) | (local << 1) | (this.score << 2)
        ];
    }

};
