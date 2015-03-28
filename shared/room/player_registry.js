'use strict';

/**
 * @constructor
 */
xss.room.PlayerRegistry = function() {
    /** @type {Array.<xss.room.Player>} */
    this.players = [];
};

xss.room.PlayerRegistry.prototype = {

    destruct: function() {
        this.players.length = 0;
    },

    /** @return {Array.<xss.room.Player>} */
    filter: function(filter) {
        return xss.util.filter(this.players, filter);
    },

    /**
     * @param {xss.room.Player} localPlayer
     * @return {Array}
     */
    serialize: function(localPlayer) {
        var serialized = [];
        for (var i = 0, m = this.players.length; i < m; i++) {
            serialized.push(this.players[i].serialize(localPlayer === this.players[i]));
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
            this.players.splice(index, 1);
        }
    },

    /**
     * @return {number}
     */
    getTotal: function() {
        return this.players.length;
    },

    /**
     * @param {xss.room.Player} player
     * @return {boolean}
     */
    isHost: function(player) {
        return 0 === this.players.indexOf(player);
    }

};
