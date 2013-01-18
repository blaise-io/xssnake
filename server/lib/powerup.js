/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var events = require('../shared/events.js');
var Room = require('./room.js');
/** @type {Util} */
var Util = require('../shared/util.js');

/**
 * Powerup
 * @param {Game} game
 * @param {Client} client
 * @constructor
 */
function Powerup(game, client) {
    this.game = game;
    this.client = client;
    this._triggerPowerup();
}

module.exports = Powerup;

Powerup.prototype = {

    /**
     * @private
     */
    _triggerPowerup: function() {
        var i, m, random, powerups, cumulative = 0;

        powerups = this._getPowerups();

        for (i = 0, m = powerups.length; i < m; i++) {
            cumulative += powerups[i][0];
            powerups[i][0] = cumulative;
        }

        random = cumulative * Math.random();

        for (i = 0, m = powerups.length; i < m; i++) {
            if (powerups[i][0] > random) {
                powerups[i][1].bind(this)();
                break;
            }
        }
    },

    /**
     * @return {Array}
     * @private
     */
    _getPowerups: function() {
        var chance, beneficial, neutral, harmful;

        chance = this.game.room.rank(
            this.client,
            // Y-axis: Leading, Neutral, Losing
            // X-axis: Beneficial, Neutral, Harmful
            [0.1, 0.5, 0.4],
            [0.4, 0.4, 0.2],
            [0.6, 0.3, 0.1]
        );

        // Legend
        beneficial = chance[0];
        neutral    = chance[1];
        harmful    = chance[2];

        return [
            // Weight, Powerup
            [beneficial, this._speedUp],
            [beneficial, this._reverseOthers],
            [neutral, this._appleSpree],
            [neutral, this._powerupSpree],
            [harmful, this._reverseClient]
            // TODO: Implement more powerups, like:
            //  - Temporary Speed Up/Speed Down,
            //  - Temporary Reversed controls (no prep...)
            //  - Spawn stuff near a snake, far from a snake
            //  - Invincible snake
            //  - Long tail
            //  - Cut tail
        ];
    },

    _clientIndex: function() {
        return this.game.room.clients.indexOf(this.client);
    },

    /**
     * Change snake speed
     * @private
     */
    _speedUp: function() {
        var game = this.game,
            index = this._clientIndex(),
            snake = this.client.snake;
        snake.speed -= 5;
        game.room.emit(events.CLIENT_SNAKE_SPEED, [index, snake.speed]);
        game.room.emit(events.CLIENT_SNAKE_ACTION, [index, 'Speed+']);
    },

    /**
     * Spawn multiple apples
     * @private
     */
    _appleSpree: function() {
        var r = Util.randomBetween(2, 6), game = this.game;
        this._spawn(game.spawner.APPLE, r, 'Apples+');
    },

    /**
     * Spawn multiple powerups
     * @private
     */
    _powerupSpree: function() {
        var r = Util.randomBetween(2, 4), game = this.game;
        this._spawn(game.spawner.POWERUP, r, 'Power-ups+');
    },

    /**
     * @param {number} type
     * @param {number} amount
     * @param {string} message
     * @private
     */
    _spawn: function(type, amount, message) {
        var index, spawn, game = this.game;

        index = this._clientIndex();
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
     * @private
     */
    _reverseOthers: function() {
        var client = this.client,
            game = this.game,
            snakes = game.snakes, index = game.room.clients.indexOf(client);
        for (var i = 0, m = snakes.length; i < m; i++) {
            if (i !== index) {
                game.room.emit(events.CLIENT_SNAKE_ACTION, [i, 'Reverse']);
                game.reverseSnake(i);
            }
        }
    },

    _reverseClient: function() {
        var index = this._clientIndex();
        this.game.room.emit(events.CLIENT_SNAKE_ACTION, [index, 'Reverse']);
        this.game.reverseSnake(index);
    }

};