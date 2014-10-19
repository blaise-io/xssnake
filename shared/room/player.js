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
     * @param {xss.room.Player} localPlayer
     * @return {Array.<string|number>}
     */
    serialize: function(localPlayer) {
        return [this.name, this.score, Number(localPlayer === this)];
    },

    /**
     * @param {Array.<string|number>} serialized
     */
    deserialize: function(serialized) {
        this.name = serialized[0];
        this.score = serialized[1];
        this.local = Boolean(serialized[2]);
    }

};
