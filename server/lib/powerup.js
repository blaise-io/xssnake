/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var Room = require('./room.js');
var Util = require('../shared/util.js');
var CONST = require('../shared/const.js');

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
            [0.1, 0.3, 0.6],
            [0.4, 0.4, 0.2],
            [0.7, 0.3, 0.0]
        );

        beneficial = chance[0];
        neutral    = chance[1];
        harmful    = chance[2];

        return [
            // [Rareness * Beneficial Weight, Powerup]
            [1.5 * beneficial, this._speedIncPerm],
            [0.8 * beneficial, this._reverseOthers],
            [1.2 * beneficial, this._speedBoostOthers],
            [1.1 * beneficial, this._speedDownOthers],
            [1.1 * beneficial, this._IncTailSelf],
            [0.7 * beneficial, this._cutTailOthers],

            [1.5 * neutral, this._spawnApples],
            [1.1 * neutral, this._spawnPowerups],

            [0.8 * harmful, this._reverseSelf],
            [1.3 * harmful, this._speedBoostSelf],
            [1.1 * harmful, this._incTailOthers],
            [0.8 * harmful, this._cutTailSelf],
            [1.5 * harmful, this._speedDownSelf]

            // TODO: Disable some powerups in hard levels
            // as they will result in immediate death.
            // TODO: Implement more powerups, like:
            //  - Spawn stuff near a snake, far from a snake
            //  - Invincible snake
            //  - More neutral power-ups
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
        return this.client.index;
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
        snake.speed -= 15;
        room.buffer(CONST.EVENT_SNAKE_SPEED, [index, snake.speed]);
        room.buffer(CONST.EVENT_SNAKE_ACTION, [index, '+Speed']).flush();
    },

    _speedBoostSelf: function() {
        this._speed([this.client], -50, '5s Fast', 5000);
    },

    _speedBoostOthers: function() {
        this._speed(this._others(), -50, '5s Fast', 5000);
    },

    _speedDownSelf: function() {
        this._speed([this.client], 100, '10s S.l.o.o.w', 10 * 1000);
    },

    _speedDownOthers: function() {
        this._speed(this._others(), 100, '10s S.l.o.o.w', 10 * 1000);
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
            var index = clients[i].index,
                snake = clients[i].snake;
            snake.speed += delta;
            room.buffer(CONST.EVENT_SNAKE_SPEED, [index, snake.speed]);
            room.buffer(CONST.EVENT_SNAKE_ACTION, [index, label]);
        }
        room.flush();

        this._resetState(duration, function() {
            for (var i = 0, m = clients.length; i < m; i++) {
                var index = clients[i].index,
                    snake = clients[i].snake;
                snake.speed -= delta;
                room.buffer(CONST.EVENT_SNAKE_SPEED, [index, snake.speed]);
            }
            room.flush();
        });
    },

    _spawnApples: function() {
        var r = Util.randomBetween(3, 10);
        this._spawn(CONST.SPAWN_APPLE, r, '+Apples');
    },

    _spawnPowerups: function() {
        var r = Util.randomBetween(2, 5);
        this._spawn(CONST.SPAWN_POWERUP, r, '+Power-ups');
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

        game.room.emit(CONST.EVENT_SNAKE_ACTION, [index, message]);

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
            var index = clients[i].index;
            room.buffer(CONST.EVENT_SNAKE_ACTION, [index, 'Reverse']);
            this.game.reverseSnake(index);
        }
        room.flush();
    },

    _IncTailSelf: function() {
        this._tail([this.client], 20, 'Long tail');
    },

    _incTailOthers: function() {
        this._tail(this._others(), 20, 'Long tail');
    },

    _cutTailSelf: function() {
        this._tail([this.client], -10, 'Cut tail');
    },

    _cutTailOthers: function() {
        this._tail(this._others(), -10, 'Cut tail');
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
            var index = clients[i].index,
                snake = clients[i].snake;
            snake.size = Math.max(1, snake.size + delta);
            room.buffer(CONST.EVENT_SNAKE_ACTION, [index, message]);
            room.buffer(CONST.EVENT_SNAKE_SIZE, [index, snake.size]);
        }
        room.flush();
    }

};
