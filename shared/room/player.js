'use strict';

/**
 * @param {string=} name;
 * @constructor
 */
xss.room.Player = function(name) {
    this.name = name || null;
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
        console.log('serialize', local);
        return [
            this.name, (this.connected << 0) | (local << 1) | (this.score << 2)
        ];
    },

    /**
     * @param {Array.<string|number>} serialized
     */
    deserialize: function(serialized) {
        this.name      = serialized[0];
        this.connected = Boolean((serialized[1] & 1) >> 0);
        this.local     = Boolean((serialized[1] & 2) >> 1);
        this.score     = serialized[1] >> 2;

        console.log('deserialize', this.local);
    }

};
