/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var util = require('util');
var Spawner = require('./spawner.js');
var Powerup = require('./powerup.js');
var Level = require('../shared/level.js');
var Snake = require('../shared/snake.js');
var Util = require('../shared/util.js');
var CONST = require('../shared/const.js');

/**
 * @param {Room} room
 * @param {number} levelID
 * @constructor
 */
function Game(room, levelID) {
    this.room = room;
    this.server = room.server;

    this.level = new Level(this.server.levels[levelID]);
    this.spawner = new Spawner(this);
    this.options = this.room.options;

    this.snakes = [];
    this.timers = [];

    this._roundEnded = false;
    this._tickBound = this._tick.bind(this);
}

module.exports = Game;

Game.prototype = {

    CRASH_OBJECTS: {
        WALL    : 0,
        SELF    : 1,
        OPPONENT: 2
    },

    countdown: function() {
        var delay = CONST.TIME_COUNTDOWN_FROM * 1000;
        this.timers.push(setTimeout(this.start.bind(this), delay));
        this.room.emit(CONST.EVENT_GAME_COUNTDOWN);
        this._setupClients();
    },

    start: function() {
        console.log('___ NEW ROUND IN ROOM ' + this.room.key + ' ___');
        this.room.emit(CONST.EVENT_GAME_START, []);
        this.room.round++;

        this.server.pubsub.on('tick', this._tickBound);

        var respawnAfter = CONST.TIME_RESPAWN_APPLE * 1000;
        this.spawner.spawn(CONST.SPAWN_APPLE, undefined, true, respawnAfter);

        if (this.options[CONST.FIELD_POWERUPS]) {
            this._delaySpawnPowerup();
        }
    },

    destruct: function() {
        var ticker = this.server.pubsub;

        if (ticker.listeners('tick')) {
            ticker.removeListener('tick', this._tickBound);
        }

        for (var i = 0, m = this.timers.length; i < m; i++) {
            clearTimeout(this.timers[i]);
        }

        if (this.spawner) {
            this.spawner.destruct();
            this.spawner = null;
        }

        this.snakes = null;
        this.level = null;
    },

    /**
     * @param {Client} client
     * @param {Array.<Array>} clientParts
     * @param {number} direction
     */
    updateSnake: function(client, clientParts, direction) {
        var sync, serverParts, common, mismatches, snake = client.snake;

        // Always allow a new direction
        client.snake.direction = direction;

        // Crop client snake because we don't trust the length the client sent
        sync = CONST.NETCODE_SYNC_MS / client.snake.speed;
        clientParts = clientParts.slice(-sync);

        // Don't allow gaps in the snake
        if (this._containsGaps(clientParts)) {
            this._emitSnakeRoom(client);
            return;
        }

        // Find latest tile where client and server matched
        serverParts = client.snake.parts.slice(-sync);
        common = this._findCommon(clientParts, serverParts);

        // Reject if there was no common
        if (!common) {
            this._emitSnakeRoom(client);
            return;
        }

        // Check if client-server delta does not exceed limit
        mismatches = serverParts.length - common[1] - 1;
        if (mismatches > this._maxMismatches(client)) {
            this._emitSnakeRoom(client);
            return;
        }

        // Glue snake back together
        snake.parts.splice(-sync);
        snake.parts = snake.parts.concat(
            serverParts.slice(0, common[1] + 1),
            clientParts.slice(common[0] + 1)
        );

        // Handle new location
        if (this._isCrash(client, snake.parts)) {
            this._crashSnake(client, snake.parts);
        } else {
            client.snake.limbo = false;
            this.spawner.handleHits(client, client.snake.head());
            this._broadcastSnakeRoom(client);
        }
    },

    /**
     * Reverse Snake (powerup)
     * @param {number} index
     */
    reverseSnake: function(index) {
        var data, dx, dy, snake = this.snakes[index];

        dx = snake.parts[0][0] - snake.parts[1][0];
        dy = snake.parts[0][1] - snake.parts[1][1];

        if (dx !== 0) {
            snake.direction = (dx === -1) ? 0 : 2;
        } else {
            snake.direction = (dy === -1) ? 1 : 3;
        }

        snake.parts.reverse();
        data = [index, snake.parts, snake.direction];
        this.room.buffer(CONST.EVENT_SNAKE_UPDATE, data);
    },

    /**
     * @param client
     */
    clientDisconnect: function(client) {
        this._crashSnake(client, client.snake.parts);
    },

    /**
     * @param client
     */
    emitState: function(client) {
        this.emitSnakes(client);
        this.emitSpawns(client);
    },

    /**
     * @param client
     */
    emitSnakes: function(client) {
        for (var i = 0, m = this.snakes.length; i < m; i++) {
            var data = [i, this.snakes[i].parts, this.snakes[i].direction];
            client.buffer(CONST.EVENT_SNAKE_UPDATE, data);
        }
        client.flush();
    },

    /**
     * Send all apples and powerups
     * @param client
     */
    emitSpawns: function(client) {
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
        client.flush();
    },

    /**
     * @param {Client} client
     * @param {number} index
     */
    hitApple: function(client, index) {
        var clientIndex, size, score;

        clientIndex = client.index;
        size = client.snake.size += 3;
        score = ++this.room.points[clientIndex];

        this.room.buffer(CONST.EVENT_GAME_DESPAWN, index);
        this.room.buffer(CONST.EVENT_SNAKE_SIZE, [clientIndex, size]);
        this.room.buffer(CONST.EVENT_SNAKE_ACTION, [clientIndex, 'Nom']);
        this.room.buffer(CONST.EVENT_SCORE_UPDATE, [clientIndex, score]);
        this.room.flush();
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
     * @return {Array.<number>}
     */
    getEmptyLocation: function() {
        var locations = this.spawner.locations.slice();
        for (var i = 0, m = this.snakes.length; i < m; i++) {
            var parts = this.snakes[i].parts;
            for (var ii = 0, mm = parts.length; ii < mm; ii++) {
                locations.push(parts[ii]);
            }
        }
        return this.level.getEmptyLocation(locations);
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
    _delaySpawnPowerup: function() {
        var timer, range, delay;
        range = CONST.TIME_SPAWN_POWERUP;
        delay = Util.randomRange(range[0] * 1000, range[1] * 1000);
        timer = setTimeout(function() {
            this.spawner.spawn(CONST.SPAWN_POWERUP);
            this._delaySpawnPowerup();
        }.bind(this), delay);
        this.timers.push(timer);
    },

    /**
     * @param {Client} client
     * @private
     */
    _emitSnakeRoom: function(client) {
        var data = [
            client.index,
            client.snake.parts,
            client.snake.direction
        ];
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
     * @return {Array.<number>}
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
                return [this.CRASH_OBJECTS.WALL, clients.indexOf(client)];
            }

            // Self
            if (m > 4) {
                if (m - 1 !== i && eq(part, parts[m - 1])) {
                    return [this.CRASH_OBJECTS.SELF, clients.indexOf(client)];
                }
            }

            // Opponent
            for (var ii = 0, mm = clients.length; ii < mm; ii++) {
                if (client !== clients[ii] && clients[ii].snake.hasPart(part)) {
                    return [this.CRASH_OBJECTS.OPPONENT, client.index, ii];
                }
            }
        }

        return null;
    },

    /**
     * @param {Client} client
     * @param {Array.<Array>} parts
     * @private
     */
    _crashSnake: function(client, parts) {
        client.snake.crashed = true;
        var clientIndex = client.index;
        this.room.emit(CONST.EVENT_SNAKE_CRASH, [clientIndex, parts]);
        this._checkRoundEnded();
    },

    /**
     * @private
     */
    _checkRoundEnded: function() {
        var clients, numcrashed, alive;

        clients = this.room.clients;
        numcrashed = 0;

        for (var i = 0, m = clients.length; i < m; i++) {
            if (clients[i].snake.crashed) {
                numcrashed++;
            } else {
                alive = clients[i];

                // Knockout system points
                this.room.emit(
                    CONST.EVENT_SCORE_UPDATE,
                    [i, this.room.points[i] += 2]
                );
            }
        }

        if (numcrashed >= clients.length -1 && !this._roundEnded) {
            this._endRound();
        }
    },

    /**
     * @private
     */
    _endRound: function() {
        this._roundEnded = true;
        this.room.emit(
            CONST.EVENT_CHAT_NOTICE,
            'New round starting in ' + CONST.TIME_GLOAT + ' seconds'
        );
        setTimeout(this._startNewRound.bind(this), CONST.TIME_GLOAT * 1000);
    },

    /**
     * @private
     */
    _startNewRound: function() {
        this.server.pubsub.removeListener('tick', this._tickBound);
        this.room.nextRound();
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
                this._applyPredictedPosition(client);
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
    _applyPredictedPosition: function(client) {
        var predict, predictParts, snake, crash;

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

        if (client.snake.limbo) {
            if (+new Date() - snake.limbo.start >= client.rtt) {
                this._emitCrashMessage(snake.limbo.crash);
                this._crashSnake(client, snake.limbo.parts);
            }
        } else {
            crash = this._isCrash(client, predictParts);
            if (crash) {
                snake.limbo = {
                    parts: snake.parts.slice(),
                    crash: crash,
                    start: +new Date()
                };
            } else {
                snake.move(predict);
                this.spawner.handleHits(client, predict);
            }
        }
    },

    /**
     * @param {Array.<number>} crash
     * @private
     */
    _emitCrashMessage: function(crash) {
        var message, object = crash[0];
        if (object === this.CRASH_OBJECTS.WALL) {
            message = util.format('{%d} crashed into a wall', crash[1]);
        } else if (object === this.CRASH_OBJECTS.SELF) {
            message = util.format('{%d} crashed into own tail', crash[1]);
        } else if (object === this.CRASH_OBJECTS.OPPONENT) {
            message = util.format('{%d} crashed into {%d}', crash[1], crash[2]);
        }
        this.room.emit(CONST.EVENT_CHAT_NOTICE, message);
    },

    /**
     * @private
     */
    _setupClients: function() {
        var clients = this.room.clients;
        for (var i = 0, m = clients.length; i < m; i++) {
            var snake = this._spawnSnake(i);
            this.snakes[i] = snake;
            clients[i].snake = snake;
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
