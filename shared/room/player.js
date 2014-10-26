'use strict';

/**
 * @constructor
 */
xss.room.Player = function() {
    this.connected = false;
    this.name = null;
    this.score = 0;
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
    },

    /**
     * @param {Array.<string|number>} serialized
     */
    deserialize: function(serialized) {
        this.name = serialized[0];
        this.score = serialized[1] >> 2;
        this.connected = Boolean(serialized[1] & 1);
        this.local = Boolean((serialized[1] & 2) >> 1);
    }

};
