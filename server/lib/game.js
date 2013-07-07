/*jshint globalstrict:true, node:true, sub:true*/
'use strict';

var util = require('util');
var Spawner = require('./spawner.js');
var Powerup = require('./powerup.js');
var Crash = require('./crash.js');
var Level = require('../shared/level.js');
var Snake = require('../shared/snake.js');
var Util = require('../shared/util.js');
var CONST = require('../shared/const.js');

/**
 * @param {Round} round
 * @param {number} levelIndex
 * @constructor
 */
function Game(round, levelIndex) {
    this.round = round;
    this.room = round.room;
    this.server = this.room.server;

    this.options = this.room.options;

    this.level = new Level(this.server.levels[levelIndex]);
    this.spawner = new Spawner(this);

    /** @type {Array.<number>} */
    this.timers = [];

    /** @type {Array.<Snake>} */
    this.snakes = [];

    this._tickBound = this._tick.bind(this);
}

module.exports = Game;

Game.prototype = {

    destruct: function() {
        this.stop();
        this.spawner.destruct();
        this._clearTimers();

        this.room = null;
        this.round = null;
        this.server = null;
        this.level = null;
        this.spawner = null;
        this.snakes = [];
    },

    start: function() {
        this.spawnSnakes();
        this.server.pubsub.on('tick', this._tickBound);
        this.spawner.spawn(CONST.SPAWN_APPLE);
        if (this.options[CONST.FIELD_POWERUPS]) {
            this._spawnSomethingAfterDelay();
        }
    },

    stop: function() {
        var pubsub = this.server.pubsub;
        if (pubsub.listeners('tick')) {
            pubsub.removeListener('tick', this._tickBound);
        }
    },

    /**
     * @param {Client} client
     * @param {Array.<Array>} clientParts
     * @param {number} direction
     * @returns {number}
     */
    updateSnake: function(client, clientParts, direction) {
        var crash, sync, serverParts, common, mismatches, snake = client.snake;

        // Always allow a new direction
        client.snake.direction = direction;

        // Crop client snake because we don't trust the length the client sent
        sync = CONST.NETCODE_SYNC_MS / client.snake.speed;
        clientParts = clientParts.slice(-sync);

        // Don't allow gaps in the snake
        if (this._containsGaps(clientParts)) {
            this._emitSnakeRoom(client);
            return CONST.UPDATE_ERR_GAP;
        }

        // Find latest tile where client and server matched
        serverParts = client.snake.parts.slice(-sync);
        common = this._findCommon(clientParts, serverParts);

        // Reject if there was no common
        if (!common) {
            this._emitSnakeRoom(client);
            return CONST.UPDATE_ERR_NO_COMMON;
        }

        // Check if client-server delta does not exceed limit
        mismatches = Math.abs(common[1] - common[0]);
        if (mismatches > this._maxMismatches(client)) {
            this._emitSnakeRoom(client);
            return CONST.UPDATE_ERR_MISMATCHES;
        }

        // Glue snake back together
        snake.parts.splice(-sync);
        snake.parts = snake.parts.concat(
            serverParts.slice(0, common[1] + 1),
            clientParts.slice(common[0] + 1)
        );
        snake.trim();

        // Handle new location
        crash = this._isCrash(client, snake.parts);
        snake.limbo = crash;

        if (crash) {
            this._crashSnake(client, snake.parts);
            this.room.rounds.delegateCrash();
        } else {
            this.spawner.handleHits(client, snake.head());
            this._broadcastSnakeRoom(client);
        }

        return CONST.UPDATE_SUCCES;
    },

    /**
     * @param client
     */
    removeClient: function(client) {
        if (client.snake) {
            this._crashSnake(client);
            this.snakes.splice(client.index, 1);
        }
    },

    /**
     * @param client
     */
    emitState: function(client) {
        this.bufferSnakesState(client);
        this.bufferSpawnsState(client);
        client.flush();
    },

    /**
     * @param client
     */
    bufferSnakesState: function(client) {
        for (var i = 0, m = this.snakes.length; i < m; i++) {
            var data = [i, this.snakes[i].parts, this.snakes[i].direction];
            client.buffer(CONST.EVENT_SNAKE_UPDATE, data);
        }
    },

    /**
     * Send all apples and powerups
     * @param client
     */
    bufferSpawnsState: function(client) {
        var spawner = this.spawner,
            spawns = spawner.spawns;
        for (var i = 0, m = spawns.length; i < m; i++) {
            var spawn = spawns[i];
            if (null !== spawn) {
                client.buffer(CONST.EVENT_GAME_SPAWN, [
                    spawn.type, i, spawn.location
                ]);
            }
        }
    },

    /**
     * @param {Client} client
     * @param {number} index
     */
    hitApple: function(client, index) {
        var size = client.snake.size += 3;

        this.room.buffer(CONST.EVENT_GAME_DESPAWN, index);
        this.room.buffer(CONST.EVENT_SNAKE_SIZE, [client.index, size]);
        this.room.buffer(CONST.EVENT_SNAKE_ACTION, [client.index, 'Nom']);
        this.room.rounds.score.bufferApplePoints(client);
        this.room.flush();

        // There should always be at least one apple in the game.
        if (0 === this.spawner.numOfType(CONST.SPAWN_APPLE)) {
            this.spawner.spawn(CONST.SPAWN_APPLE);
        }
    },

    /**
     * @param {Client} client
     * @param {number} index
     */
    hitPowerup: function(client, index) {
        this.room.emit(CONST.EVENT_GAME_DESPAWN, index);
        return new Powerup(this, client);
    },

    /**
     * @return {Array.<Array.<number>>}
     */
    getNonEmptyLocations: function() {
        var locations = this.spawner.locations.slice();
        for (var i = 0, m = this.snakes.length; i < m; i++) {
            var parts = this.snakes[i].parts;
            for (var ii = 0, mm = parts.length; ii < mm; ii++) {
                locations.push(parts[ii]);
            }
        }
        return locations;
    },

    /**
     * @return {Array.<number>}
     */
    getEmptyLocation: function() {
        var locations = this.getNonEmptyLocations();
        return this.level.getEmptyLocation(locations);
    },

    spawnSnakes: function() {
        var clients = this.room.clients;
        for (var i = 0, m = clients.length; i < m; i++) {
            var snake = this._spawnSnake(i);
            this.snakes[i] = snake;
            clients[i].snake = snake;
        }
    },

    showLotsOfApples: function() {
        var locations, levelData, spawnRow, y = 1;

        this._spawnSomething = Util.dummy;

        locations = this.getNonEmptyLocations();
        levelData = this.level.levelData;

        spawnRow = function() {
            for (var x = y % 4, mm = levelData.width; x < mm; x += 4) {
                if (this.level.isEmptyLocation(locations, [x, y])) {
                    this.spawner.spawn(CONST.SPAWN_APPLE, [x, y], true);
                }
            }
            this.room.flush();
            y += 3;
            if (y < levelData.height) {
                setTimeout(spawnRow, 50);
            }
        }.bind(this);

        spawnRow();
    },

    /**
     * @param {Array.<Array>} parts
     * @returns {boolean}
     * @private
     */
    _containsGaps: function(parts) {
        for (var i = 1, m = parts.length; i < m; i++) {
            // Sanity check
            if (parts[i].length !== 2 ||
                typeof parts[i][0] !== 'number' ||
                typeof parts[i][1] !== 'number'
            ) {
                return false;
            }
            // Delta must be 1
            if (Util.delta(parts[i], parts[i - 1]) !== 1) {
                return true;
            }
        }
        return false;
    },

    /**
     * @param {Array.<Array>} clientParts
     * @param {Array.<Array>} serverParts
     * @returns {Array.<number>} common
     * @private
     */
    _findCommon: function(clientParts, serverParts) {
        for (var i = clientParts.length - 1; i >= 0; i--) {
            for (var ii = serverParts.length - 1; ii >= 0; ii--) {
                if (Util.eq(clientParts[i], serverParts[ii])) {
                    return [i, ii];
                }
            }
        }
        return null;
    },

    /**
     * @param {Client} client
     * @return {number}
     * @private
     */
    _maxMismatches: function(client) {
        var rtt = Math.min(CONST.NETCODE_SYNC_MS, client.rtt);
        return Math.ceil((rtt + 20) / client.snake.speed);
    },

    /**
     * @private
     */
    _spawnSomethingAfterDelay: function() {
        var delay, range = CONST.SPAWN_SOMETHING_EVERY;
        delay = Util.randomRange(range[0] * 1000, range[1] * 1000);
        this.timers.push(
            setTimeout(this._spawnSomething.bind(this), delay)
        );
    },

    /**
     * @private
     */
    _spawnSomething: function() {
        var powerupsEnabled, randomResultApple, type;

        powerupsEnabled = this.options[CONST.FIELD_POWERUPS];
        randomResultApple = Math.random() <= CONST.SPAWN_CHANCE_APPLE;

        type = (!powerupsEnabled || randomResultApple) ?
            CONST.SPAWN_APPLE : CONST.SPAWN_POWERUP;

        this.spawner.spawn(type);
        this._spawnSomethingAfterDelay();
    },

    /**
     * @private
     */
    _clearTimers: function() {
        for (var i = 0, m = this.timers.length; i < m; i++) {
            clearTimeout(this.timers[i]);
        }
    },

    /**
     * @param {Client} client
     * @private
     */
    _emitSnakeRoom: function(client) {
        var data = [client.index, client.snake.parts, client.snake.direction];
        this.room.emit(CONST.EVENT_SNAKE_UPDATE, data);
    },

    /**
     * @param {Client} client
     * @private
     */
    _broadcastSnakeRoom: function(client) {
        var data = [
            client.index,
            client.snake.parts,
            client.snake.direction
        ];
        client.broadcast(CONST.EVENT_SNAKE_UPDATE, data);
    },

    /**
     * @param {Client} client
     * @param {Array.<Array>} parts
     * @return {Crash}
     * @private
     */
    _isCrash: function(client, parts) {
        var eq, clients, level;

        eq = Util.eq;
        clients = this.room.clients;
        level = this.level;

        for (var i = 0, m = parts.length; i < m; i++) {
            var part = parts[i];

            // Wall
            if (level.isWall(part[0], part[1])) {
                return new Crash(CONST.CRASH_WALL, client);
            }

            // Self
            if (m > 4) {
                if (m - 1 !== i && eq(part, parts[m - 1])) {
                    return new Crash(CONST.CRASH_SELF, client);
                }
            }

            // Opponent
            for (var ii = 0, mm = clients.length; ii < mm; ii++) {
                if (client !== clients[ii] && clients[ii].snake.hasPart(part)) {
                    return new Crash(CONST.CRASH_OPPONENT, client, clients[ii]);
                }
            }
        }

        return null;
    },

    /**
     * @param {Client} client
     * @param {Array.<Array>=} parts
     * @param {boolean=} noEmit
     * @private
     */
    _crashSnake: function(client, parts, noEmit) {
        var snake = client.snake;
        if (snake.limbo) {
            if (!noEmit) {
                snake.limbo.emitNotice();
            }
            parts = snake.limbo.parts;
        }
        parts = parts || snake.parts;
        snake.crashed = true;
        this.room.emit(CONST.EVENT_SNAKE_CRASH, [client.index, parts]);
    },

    /**
     * @param {number} delta
     * @private
     */
    _tick: function(delta) {
        var clients = this.room.clients;
        for (var i = 0, m = clients.length; i < m; i++) {
            this._tickClient(clients[i], delta);
        }
    },

    /**
     * @param {Client} client
     * @param {number} delta
     * @private
     */
    _tickClient: function(client, delta) {
        var snake = client.snake;
        if (!snake.crashed) {
            if (snake.elapsed >= snake.speed) {
                snake.elapsed -= snake.speed;
                this._applyNewPosition(client);
                snake.trim();
            }
            snake.elapsed += delta;
        }
    },

    /**
     * @param {Snake} snake
     * @return {Array.<number>}
     * @private
     */
    _getPredictPosition: function(snake) {
        var head, shift;
        head = snake.head();
        shift = [[-1, 0], [0, -1], [1, 0], [0, 1]][snake.direction];
        return [head[0] + shift[0], head[1] + shift[1]];
    },

    /**
     * @param {Client} client
     * @private
     */
    _applyNewPosition: function(client) {
        var predict, predictParts, snake, crash, opponent;

        snake = client.snake;
        predict = this._getPredictPosition(snake);

        predictParts = snake.parts.slice(1);
        predictParts.push(predict);

        // A snake is in limbo when the server predicts that a snake has
        // crashed. The prediction is wrong when the client made a turn
        // in time but that message was received too late by the server
        // because of network latency. When the turn message is received by
        // the server, and it seems like the server made a wrong prediction,
        // the snake returns back to life. The snake will be crashed When the
        // limbo time exceeds the latency.

        if (snake.limbo && +new Date() - snake.limbo.time >= client.rtt) {
            this._crashSnake(client);
            opponent = snake.limbo.opponent;
            if (opponent && snake.limbo.draw) {
                this._crashSnake(opponent, null, true);
            }
            this.room.rounds.delegateCrash();
        } else {
            crash = this._isCrash(client, predictParts);
            if (crash) {
                snake.limbo = crash;
            } else {
                snake.move(predict);
                this.spawner.handleHits(client, predict);
            }
        }
    },

    /**
     * @param {number} index
     * @return {Snake}
     * @private
     */
    _spawnSnake: function(index) {
        var spawn, direction, snake, size, speed;

        spawn = this.level.getSpawn(index);
        direction = this.level.getSpawnDirection(index);
        size = CONST.SNAKE_SIZE;
        speed = CONST.SNAKE_SPEED;

        snake = new Snake(spawn, direction, size, speed);
        snake.elapsed = 0;

        return snake;
    }

};
