'use strict';

/**
 * @constructor
 */
xss.room.PlayerRegistry = function() {
    /** @type {xss.room.Player} */
    this.players = [];
};

xss.room.PlayerRegistry.prototype = {

    destruct: function() {
        this.players.length = 0;
    },

    /**
     * @returns {Array}
     */
    serialize: function() {
        var serialized = [];
        for (var i = 0, m = this.players.length; i < m; i++) {
            serialized.push(this.players[i].serialize());
        }
        return serialized;
    },

    /**
     * @param {xss.room.Player} player
     */
    add: function(player) {
        this.players.push(player);
    },

    /**
     * @param {xss.room.Player} player
     */
    remove: function(player) {
        var index = this.players.indexOf(player);
        if (-1 !== index) {
            this.players.splice(this.players.indexOf(player), 1);
        }
    },

    getTotal: function() {
        return this.players.length;
    }

};
