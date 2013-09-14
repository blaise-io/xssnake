'use strict';

var Util = require('../shared/util.js');
var CONST = require('../shared/const.js');

/**
 * Spawner
 * @param {Game} game
 * @constructor
 */
function Spawner(game) {
    this.game = game;
    this.spawns = [];
    this.locations = []; // Keep separate list for getEmptyLocation speed
}

module.exports = Spawner;

Spawner.prototype = {

    destruct: function() {
        for (var i = 0, m = this.spawns.length; i < m; i++) {
            this._destructSpawn(i);
        }
    },

    /**
     * @param {number} type
     * @param {Array.<number>=} location
     * @param {boolean=} buffer
     * @return {Object}
     */
    spawn: function(type, location, buffer) {
        var spawn, index, data, game = this.game;

        spawn = {
            location: location || game.getEmptyLocation(),
            type    : type
        };

        index = this.spawns.length;
        this.spawns[index] = spawn;
        this.locations[index] = spawn.location;

        data = [type, index, spawn.location];

        if (buffer) {
            game.room.buffer(CONST.EVENT_GAME_SPAWN, data);
        } else {
            game.room.emit(CONST.EVENT_GAME_SPAWN, data);
        }

        return spawn;
    },

    /**
     * @param {Client} client
     * @param {number} index
     */
    hit: function(client, index) {
        var spawn = this.spawns[index];
        this._destructSpawn(index);

        switch (spawn.type) {
            case CONST.SPAWN_APPLE:
                this.game.hitApple(client, index);
                break;
            case CONST.SPAWN_POWERUP:
                this.game.hitPowerup(client, index);
                break;
        }
    },

    /**
     * @param {Client} client
     * @param {Array.<number>} location
     * @return {Array}
     */
    handleHits: function(client, location) {
        var hits = [];
        for (var i = 0, m = this.spawns.length; i < m; i++) {
            if (this.spawns[i] && Util.eq(this.spawns[i].location, location)) {
                hits.push(i);
                this.hit(client, i);
            }
        }
        return hits;
    },

    /**
     * @param {number} type
     * @returns {number}
     */
    numOfType: function(type) {
        var num = 0;
        for (var i = 0, m = this.spawns.length; i < m; i++) {
            if (this.spawns[i] && this.spawns[i].type === type) {
                num++;
            }
        }
        return num;
    },

    /**
     * @param {number} index
     * @private
     */
    _destructSpawn: function(index) {
        this.spawns[index] = null;
        this.locations[index] = null;
    }

};
