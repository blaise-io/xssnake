/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var Util = require('../shared/util.js');
var events = require('../shared/events.js');

/**
 * Spawnable
 * @param {Game} game
 * @constructor
 */
function Spawner(game) {
    this.game = game;
    this.spawns = [];
    this.locations = []; // Keep separate list for speed
}

module.exports = Spawner;

Spawner.prototype = {

    APPLE  : 0,
    POWERUP: 1,

    EVENTS: [
        events.CLIENT_APPLE_SPAWN,
        events.CLIENT_POWERUP_SPAWN
    ],

    destruct: function() {
        for (var i = 0, m = this.spawns.length; i < m; i++) {
            this._destructSpawn(i);
        }
    },

    /**
     * @param {number} type
     * @param {number|null=} index
     * @param {boolean=} respawn
     * @param {number=} respawnAfter
     * @return {Object}
     */
    spawn: function(type, index, respawn, respawnAfter) {
        var spawn = {
            location    : this.game.getEmptyLocation(),
            type        : type,
            respawn     : !!respawn,
            respawnAfter: respawnAfter
        };

        index = (typeof index === 'number') ? index : this.spawns.length;

        if (respawnAfter) {
            spawn.timer = setTimeout(function() {
                this._destructSpawn(index);
                this.spawn(type, index, respawn, respawnAfter);
            }.bind(this), respawnAfter);
        }

        this.spawns[index] = spawn;
        this.locations[index] = spawn.location;

        this.game.room.emit(this.EVENTS[type], [index, spawn.location]);

        return spawn;
    },

    /**
     * @param {Client} client
     * @param {number} index
     */
    hit: function(client, index) {
        var spawn = this.spawns[index];

        switch (spawn.type) {
            case this.APPLE:
                this.game.hitApple(client, index);
                break;
            case this.POWERUP:
                this.game.hitPowerup(client, index);
                break;
        }

        if (spawn.respawn) {
            this._destructSpawn(index);
            this.spawn(spawn.type, index, true, spawn.respawnAfter);
        } else {
            this._destructSpawn(index);
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
            if (null !== this.spawns[i] && Util.eq(this.spawns[i].location, location)) {
                hits.push(i);
                this.hit(client, i);
            }
        }
        return hits;
    },

    /**
     * @param {number} index
     * @private
     */
    _destructSpawn: function(index) {
        var spawn = this.spawns[index];
        if (spawn && spawn.timer) {
            clearTimeout(spawn.timer);
        }
        this.spawns[index] = null;
        this.locations[index] = null;
    }

};
