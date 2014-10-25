'use strict';

/**
 * Spawner
 * @param {xss.game.Game} game
 * @constructor
 */
xss.game.Spawner = function(game) {
    this.game = game;
    this.spawns = [];
    this.locations = []; // Keep separate list for getEmptyLocation speed
};

xss.game.Spawner.prototype = {

    destruct: function() {
        for (var i = 0, m = this.spawns.length; i < m; i++) {
            this._destructSpawn(i);
        }
    },

    /**
     * @param {number} type
     * @param {xss.Coordinate=} location
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
            game.room.buffer(xss.NC_GAME_SPAWN, data);
        } else {
            game.room.emit(xss.NC_GAME_SPAWN, data);
        }

        return spawn;
    },

    /**
     * @param {xss.netcode.Client} client
     * @param {number} index
     */
    hit: function(client, index) {
        var spawn = this.spawns[index];
        this._destructSpawn(index);

        switch (spawn.type) {
            case xss.SPAWN_APPLE:
                this.game.hitApple(client, index);
                break;
            case xss.SPAWN_POWERUP:
                this.game.hitPowerup(client, index);
                break;
        }
    },

    /**
     * @param {xss.netcode.Client} client
     * @param {xss.Coordinate} location
     * @return {Array}
     */
    handleHits: function(client, location) {
        var hits = [];
        for (var i = 0, m = this.spawns.length; i < m; i++) {
            if (this.spawns[i] && xss.util.eq(this.spawns[i].location, location)) {
                hits.push(i);
                this.hit(client, i);
            }
        }
        return hits;
    },

    /**
     * @param {number} type
     * @return {number}
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
