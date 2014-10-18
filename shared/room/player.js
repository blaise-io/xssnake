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
     * @returns {Array.<string|number>}
     */
    serialize: function() {
        return [this.name, this.score];
    },

    /**
     * @param {Array.<string|number>} serialized
     */
    deserialize: function(serialized) {
        this.name = serialized[0];
        this.score = serialized[1];
    }

};
