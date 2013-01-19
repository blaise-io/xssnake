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

            [beneficial, this._speedIncPerm],
            [beneficial, this._reverseOthers],
            [beneficial, this._speedBoostOthers],
            [beneficial, this._speedDownOthers],
            [beneficial, this._IncTailSelf],
            [beneficial, this._cutTailOthers],

            [neutral, this._spawnApples],
            [neutral, this._spawnPowerups],

            [harmful, this._reverseSelf],
            [harmful, this._speedBoostSelf],
            [harmful, this._incTailOthers],
            [harmful, this._cutTailSelf],
            [harmful, this._speedDownSelf]

            // TODO: Implement more powerups, like:
            //  - Spawn stuff near a snake, far from a snake
            //  - Invincible snake
        ];
    },

    /**
     * @return {Array.<Client>}
     * @private
     */
    _others: function() {
        var clients = this.game.room.clients.slice();
        clients.splice(this._clientIndex(), 1);
        return clients;
    },

    /**
     * @return {number}
     * @private
     */
    _clientIndex: function() {
        return this.game.room.clients.indexOf(this.client);
    },

    /**
     * @param {number} delay
     * @param {Function} callback
     * @private
     */
    _resetState: function(delay, callback) {
        var timer = setTimeout(callback, delay);
        this.game.timers.push(timer);
    },

    _speedIncPerm: function() {
        var room = this.game.room,
            index = this._clientIndex(),
            snake = this.client.snake;
        snake.speed -= 5;
        room.buffer(events.CLIENT_SNAKE_SPEED, [index, snake.speed]);
        room.buffer(events.CLIENT_SNAKE_ACTION, [index, '+Speed']).flush();
    },

    _speedBoostSelf: function() {
        this._speed([this.client], -100, '5s Boost', 5000);
    },

    _speedBoostOthers: function() {
        this._speed(this._others(), -100, '5s Boost', 5000);
    },

    _speedDownSelf: function() {
        this._speed([this.client], 100, '7s Snail', 7000);
    },

    _speedDownOthers: function() {
        this._speed(this._others(), 100, '7s Snail', 7000);
    },

    /**
     * @param {Array.<Client>} clients
     * @param {number} delta
     * @param {string} label
     * @param {number} duration
     * @private
     */
    _speed: function(clients, delta, label, duration) {
        var room = this.game.room;
        for (var i = 0, m = clients.length; i < m; i++) {
            var index = room.clients.indexOf(clients[i]),
                snake = clients[i].snake;
            snake.speed += delta;
            room.buffer(events.CLIENT_SNAKE_SPEED, [index, snake.speed]);
            room.buffer(events.CLIENT_SNAKE_ACTION, [index, label]);
        }
        room.flush();

        this._resetState(duration, function() {
            for (var i = 0, m = clients.length; i < m; i++) {
                var index = room.clients.indexOf(clients[i]),
                    snake = clients[i].snake;
                snake.speed -= delta;
                room.buffer(events.CLIENT_SNAKE_SPEED, [index, snake.speed]);
            }
            room.flush();
        });
    },

    _spawnApples: function() {
        var r = Util.randomBetween(2, 6), game = this.game;
        this._spawn(game.spawner.APPLE, r, '+Apples');
    },

    _spawnPowerups: function() {
        var r = Util.randomBetween(2, 4), game = this.game;
        this._spawn(game.spawner.POWERUP, r, '+Power-ups');
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

    _reverseSelf: function() {
        this._reverse([this.client]);
    },

    _reverseOthers: function() {
        this._reverse(this._others());
    },

    /**
     * @param {Array.<Client>} clients
     * @private
     */
    _reverse: function(clients) {
        var room = this.game.room;
        for (var i = 0, m = clients.length; i < m; i++) {
            var index = room.clients.indexOf(clients[i]);
            room.buffer(events.CLIENT_SNAKE_ACTION, [index, 'Reverse']);
            this.game.reverseSnake(index);
        }
        room.flush();
    },

    _IncTailSelf: function() {
        this._tail([this.client], 15, 'Long tail');
    },

    _incTailOthers: function() {
        this._tail(this._others(), -20, 'Cut tail');
    },

    _cutTailSelf: function() {
        this._tail([this.client], -20, 'Cut tail');
    },

    _cutTailOthers: function() {
        this._tail(this._others(), 15, 'Long tail');
    },

    /**
     * @param {Array.<Client>} clients
     * @param {number} delta
     * @param {string} message
     * @private
     */
    _tail: function(clients, delta, message) {
        var room = this.game.room;
        for (var i = 0, m = clients.length; i < m; i++) {
            var index = room.clients.indexOf(clients[i]),
                snake = clients[i].snake;
            snake.size = Math.max(1, snake.size + delta);
            room.buffer(events.CLIENT_SNAKE_ACTION, [index, message]);
            room.buffer(events.CLIENT_SNAKE_SIZE, [index, snake.size]);
        }
        room.flush();
    }

};