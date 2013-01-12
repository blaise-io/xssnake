/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var events = require('../shared/events.js'),
    Util = require('../shared/util.js');

/**
 * Powerup
 * @param {Client} client
 * @param {Game} game
 * @constructor
 */
function Powerup(game, client) {
    var powerup = this._getPowerUp().bind(this);
    powerup(client, game);
}

module.exports = Powerup;

/** @const */ Powerup.APPLY_SELF = 0;
/** @const */ Powerup.APPLY_OTHERS = 1;
/** @const */ Powerup.APPLY_EITHER = 2;
/** @const */ Powerup.APPLY_ALL = 3;

Powerup.prototype = {

    /**
     * @return {Array}
     * @private
     */
    _getPowerups: function() {
        return [
            // [Weight, Powerup]
            [1, this._speed],
            [1, this._apples],
            [1, this._powerups],
            [1, this._reverse]
        ];
    },

    /**
     * @return {Function}
     * @private
     */
    _getPowerUp: function() {
        var i, m, random, powerups, cumulative = 0;

        powerups = this._getPowerups();
        for (i = 0, m = powerups.length; i < m; i++) {
            cumulative += powerups[i][0];
            powerups[i][0] = cumulative;
        }

        random = cumulative * Math.random();

        for (i = 0, m = powerups.length; i < m; i++) {
            if (powerups[i][0] > random) {
                return powerups[i][1];
            }
        }
        return powerups[0][1];
    },

    /**
     * Change snake speed
     * @param {Client} client
     * @param {Game} game
     * @private
     */
    _speed: function(client, game) {
        var index = game.room.clients.indexOf(client);
        client.snake.speed -= 5;
        game.room.emit(events.CLIENT_SNAKE_SPEED, [index, client.snake.speed]);
        game.room.emit(events.CLIENT_SNAKE_ACTION, [index, 'Speed+']);
    },

    /**
     * Spawn multiple apples
     * @param {Client} client
     * @param {Game} game
     * @private
     */
    _apples: function(client, game) {
        var r = Util.randomBetween(2, 6);
        this._spawn(client, game, game.spawner.APPLE, r, 'Apples+');
    },

    /**
     * Spawn multiple powerups
     * @param {Client} client
     * @param {Game} game
     * @private
     */
    _powerups: function(client, game) {
        var r = Util.randomBetween(2, 4);
        this._spawn(client, game, game.spawner.POWERUP, r, 'Power-ups+');
    },

    /**
     * @param {Client} client
     * @param {Game} game
     * @param {number} type
     * @param {number} amount
     * @param {string} message
     * @private
     */
    _spawn: function(client, game, type, amount, message) {
        var index, spawn;

        index = game.room.clients.indexOf(client);
        spawn = function() {
            game.spawner.spawn(type);
        };

        game.room.emit(events.CLIENT_SNAKE_ACTION, [index, message]);

        for (var i = 0; i < amount; i++) {
            setTimeout(spawn, i * 100);
        }
    },

    /**
     * Reverse Snake direction
     * @param {Client} client
     * @param {Game} game
     * @private
     */
    _reverse: function(client, game) {
        var snakes = game.snakes, index = game.room.clients.indexOf(client);
        for (var i = 0, m = snakes.length; i < m; i++) {
            if (i !== index) {
                game.room.emit(events.CLIENT_SNAKE_ACTION, [i, 'Reverse']);
                game.reverseSnake(i);
            }
        }
    }

};