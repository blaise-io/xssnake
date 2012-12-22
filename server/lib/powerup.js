/*jshint globalstrict:true, es5:true, node:true*/
'use strict';

var events = require('../shared/events.js'),
    Util = require('../shared/util.js');

/**
 * Powerup
 * @param {Array.<number>} location
 * @constructor
 */
function Powerup(location) {
    this.location = location;
}

module.exports = Powerup;

/** @const */ Powerup.APPLY_SELF = 0;
/** @const */ Powerup.APPLY_OTHERS = 1;
/** @const */ Powerup.APPLY_EITHER = 2;
/** @const */ Powerup.APPLY_ALL = 3;

Powerup.prototype = {

    /**
     * @param {Client} client
     * @param {Game} game
     */
    hit: function(client, game) {
        var powerup = this._getPowerUp();
        powerup(client, game);
    },

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
        var index = game.room.clients.indexOf(client);
        game.room.emit(events.CLIENT_SNAKE_ACTION, [index, 'Apples+']);
        for (var i = 0, m = Util.randomBetween(2, 6); i < m; i++) {
            setTimeout(game.spawnApple.bind(game), i * 100);
        }
    },

    /**
     * Spawn multiple powerups
     * @param {Client} client
     * @param {Game} game
     * @private
     */
    _powerups: function(client, game) {
        var index = game.room.clients.indexOf(client);
        game.room.emit(events.CLIENT_SNAKE_ACTION, [index, 'Power-ups+']);
        for (var i = 0, m = Util.randomBetween(2, 4); i < m; i++) {
            setTimeout(game.spawnPowerup.bind(game), i * 100);
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