/*jshint globalstrict:true, es5:true, node:true*/
'use strict';

var util = require('util'),
    Level = require('../shared/level.js'),
    levels = require('../shared/levels.js'),
    Snake = require('../shared/snake.js'),
    config = require('../shared/config.js'),
    events = require('../shared/events.js');

/**
 * @param {Room} room
 * @constructor
 */
function Game(room, levelID) {
    this.room = room;
    this.server = room.server;

    this.level = new Level(levelID, levels);

    this.apples = [this.level.getRandomOpenTile()];
    this.snakes = [];

    this._roundEnded = false;
    this._tickListener = this._tick.bind(this);
}

module.exports = Game;

Game.prototype = {

    CRASH_WALL    : 0,
    CRASH_SELF    : 1,
    CRASH_OPPONENT: 2,

    countdown: function() {
        setTimeout(this.start.bind(this), config.shared.game.countdown * 1000);
        this.room.emit(events.CLIENT_GAME_COUNTDOWN, null);
        this._setupClients();
    },

    start: function() {
        console.log('___ NEW ROUND IN ROOM ' + this.room.id + ' ___');
        this.room.emit(events.CLIENT_GAME_START, []);
        this.room.emit(events.CLIENT_APPLE_SPAWN, [0, this.apples[0]]);
        this.room.inProgress = true;
        this.server.ticker.addListener('tick', this._tickListener);
    },

    destruct: function() {
        if (this.server.ticker.listeners('tick')) {
            this.server.ticker.removeListener('tick', this._tickListener);
        }
        this.room = null;
        this.server = null;
    },

    /**
     * @param {Client} client
     * @param {Array.<Array>} parts
     * @param {number} direction
     */
    updateSnake: function(client, parts, direction) {
        var apple, head = parts[parts.length - 1];

        client.snake.direction = direction;

        // Check if server-client delta is similar enough,
        // We tolerate a small difference because of lag.
        if (this.level.gap(head, client.snake.head()) <= 1) {
            client.snake.parts = parts;
            this._broadCastSnake(client);
        } else {
            head = client.snake.head();
            parts = client.snake.parts;
            this._sendServerSnakeState(client);
        }

        if (this._isCrash(client, parts)) {
            this._setSnakeCrashed(client, parts);
        } else {
            delete client.snake.limbo;
        }

        apple = this._appleAtPosition(head);
        if (-1 !== apple) {
            this._eatApple(client, apple);
        }
    },

    clientQuit: function(client) {
        this._setSnakeCrashed(client, client.snake.parts);
    },

    /**
     * @param client
     */
    emitState: function(client) {
        for (var i = 0, m = this.snakes.length; i < m; i++) {
            var data = [i, this.snakes[i].parts, this.snakes[i].direction];
            client.emit(events.CLIENT_SNAKE_UPDATE, data);
        }
    },

    /**
     * @param {Client} client
     * @private
     */
    _sendServerSnakeState: function(client) {
        var data = [
            this.room.clients.indexOf(client),
            client.snake.parts,
            client.snake.direction
        ];
        this.room.emit(events.CLIENT_SNAKE_UPDATE, data);
    },

    /**
     * @param {Client} client
     * @private
     */
    _broadCastSnake: function(client) {
        var send = [
            this.room.clients.indexOf(client),
            client.snake.parts,
            client.snake.direction
        ];
        this.room.broadcast(events.CLIENT_SNAKE_UPDATE, send, client);
    },

    /**
     * @param {Client} client
     * @param {Array.<Array>} parts
     * @return {?Array.<number>}
     * @private
     */
    _isCrash: function(client, parts) {
        var clients = this.room.clients,
            limbo = client.snake.limbo,
            level = this.level;

        for (var i = 0, m = parts.length; i < m; i++) {
            var part = parts[i];

            // Wall
            if (level.isWall(part[0], part[1])) {
                return [this.CRASH_WALL, clients.indexOf(client)];
            }

            // Self
            if (m - 1 !== i && !level.gap(part, parts[m - 1])) {
                return [this.CRASH_SELF, clients.indexOf(client)];
            }

            // Self (limbo)
            else if (limbo && m - 2 !== i && !level.gap(part, parts[m - 2])) {
                return [this.CRASH_SELF, clients.indexOf(client)];
            }

            // Opponent
            for (var ii = 0, mm = clients.length; ii < mm; ii++) {
                if (client !== clients[ii]) {
                    if (-1 !== clients[ii].snake.partIndex(part)) {
                        return [this.CRASH_OPPONENT, clients.indexOf(client), ii];
                    }
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
    _setSnakeCrashed: function(client, parts) {
        client.snake.crashed = true;
        var clientIndex = this.room.clients.indexOf(client);
        this.room.emit(events.CLIENT_SNAKE_CRASH, [clientIndex, parts]);
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

                // Knockout points
                this.room.emit(
                    events.CLIENT_ROOM_SCORE,
                    [i, this.room.points[i] += 2]
                );
            }
        }

        if (numcrashed >= clients.length -1 && !this._roundEnded) {
            this._endRound(alive);
        }
    },

    /**
     * @param {Client=} winner
     * @private
     */
    _endRound: function(winner) {
        this._roundEnded = true;
        this.room.emit(
            events.CLIENT_CHAT_NOTICE,
            'New round starting in ' + config.shared.game.gloat + ' seconds'
        );
        void(winner);
        setTimeout(this._startNewRound.bind(this), config.shared.game.gloat * 1000);
    },

    /**
     * @private
     */
    _startNewRound: function() {
        this.server.ticker.removeListener('tick', this._tickListener);
        this.room.newRound();
    },

    /**
     * @param {Array.<number>} position
     * @return {number}
     * @private
     */
    _appleAtPosition: function(position) {
        for (var i = 0, m = this.apples.length; i < m; i++) {
            if (this.level.gap(this.apples[i], position) === 0) {
                return i;
            }
        }
        return -1;
    },

    /**
     * @param {Client} client
     * @param {number} appleIndex
     * @private
     */
    _eatApple: function(client, appleIndex) {
        var size = client.snake.size += 3;
        var clientIndex = this.room.clients.indexOf(client);
        var score = ++this.room.points[clientIndex];
        this.room.emit(events.CLIENT_APPLE_NOM, [clientIndex, size, appleIndex]);
        this.room.emit(events.CLIENT_ROOM_SCORE, [clientIndex, score]);
        this._spawnApple(appleIndex);
    },

    /**
     * @param {number} appleIndex
     * @private
     */
    _spawnApple: function(appleIndex) {
        var location = this.level.getRandomOpenTile();
        this.apples[appleIndex] = location;
        this.room.emit(events.CLIENT_APPLE_SPAWN, [appleIndex, location]);
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
        var predict, appleIndex, snake, clone, crash;

        snake = client.snake;
        predict = this._getPredictPosition(snake);

        clone = snake.parts.slice(1);
        clone.push(predict);
        crash = this._isCrash(client, clone);

        if (crash) {
            // A snake is in limbo when the server predicts that a snake has
            // crashed. The prediction is wrong when the client made a turn
            // just in time but that message was received too late by the server
            // because of network delay. When the turn message is received by
            // the server, and it seems like the server made a wrong prediction,
            // the snake returns from limbo.
            if (snake.limbo) {
                this._emitCrashMessage(crash);
                this._setSnakeCrashed(client, snake.limbo);
            } else {
                snake.limbo = snake.parts.slice();
            }
        }

        // Apple?
        appleIndex = this._appleAtPosition(predict);
        if (-1 !== appleIndex) {
            this._eatApple(client, appleIndex);
        }

        // Apply move
        if (!snake.crashed) {
            snake.move(predict);
        }
    },

    /**
     * @param {Array.<number>} crash
     * @private
     */
    _emitCrashMessage: function(crash) {
        var message;
        if (crash[0] === this.CRASH_WALL) {
            message = util.format('{%d} crashed into a wall', crash[1]);
        } else if (crash[0] === this.CRASH_SELF) {
            message = util.format('{%d} crashed into own tail', crash[1]);
        } else if (crash[0] === this.CRASH_OPPONENT) {
            message = util.format('{%d} crashed into {%d}', crash[1], crash[2]);
        }
        this.room.emit(events.CLIENT_CHAT_NOTICE, message);
    },

    /**
     * @private
     */
    _setupClients: function() {
        var clients = this.room.clients;
        for (var i = 0, m = clients.length; i < m; i++) {
            var snake = this._spawnClientSnake(i);
            this.snakes[i] = snake;
            clients[i].snake = snake;
        }
    },

    /**
     * @param {number} index
     * @return {Snake}
     * @private
     */
    _spawnClientSnake: function(index) {
        var spawn, direction, snake, size, speed;

        spawn = this.level.getSpawn(index);
        direction = this.level.getSpawnDirection(index);
        size = config.shared.snake.size;
        speed = config.shared.snake.speed;

        snake = new Snake(spawn, direction, size, speed);
        snake.elapsed = 0;

        return snake;
    }

};