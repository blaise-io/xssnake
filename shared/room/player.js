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
     * @param {xss.room.Player} local
     * @return {Array.<string|number>}
     */
    serialize: function(local) {
        return [
            this.name,
            this.score,
            Number(this.connected),
            Number(local === this)
        ];
    },

    /**
     * @param {Array.<string|number>} serialized
     */
    deserialize: function(serialized) {
        this.name = serialized[0];
        this.score = serialized[1];
        this.connected = Boolean(serialized[2]);
        this.local = Boolean(serialized[3]);
    }

};
