/*jshint globalstrict:true, es5:true, node:true*/
'use strict';

var util = require('util'),
    myutil = require('../shared/util.js'),
    levels = require('../shared/levels.js'),
    config = require('../shared/config.js'),
    events = require('../shared/events.js'),
    Level = require('../shared/level.js'),
    Snake = require('../shared/snake.js'),
    Powerup = require('./powerup.js');

/**
 * @param {Room} room
 * @param {number} levelID
 * @constructor
 */
function Game(room, levelID) {
    this.room = room;
    this.server = room.server;

    this.level = new Level(levelID, levels);

    this.snakes = [];
    this.apples = [this.level.getRandomOpenTile(this.snakes)];
    this.powerups = [];

    this._roundEnded = false;
    this._tickBound = this._tick.bind(this);
}

module.exports = Game;

Game.prototype = {

    CRASH_WALL    : 0,
    CRASH_SELF    : 1,
    CRASH_OPPONENT: 2,

    countdown: function() {
        var delay = config.shared.game.countdown * 1000;
        this._gameStartTimer = setTimeout(this.start.bind(this), delay);
        this.room.emit(events.CLIENT_GAME_COUNTDOWN, null);
        this._setupClients();
    },

    start: function() {
        console.log('___ NEW ROUND IN ROOM ' + this.room.id + ' ___');
        this.room.emit(events.CLIENT_GAME_START, []);
        this.room.emit(events.CLIENT_APPLE_SPAWN, [0, this.apples[0]]);
        this.room.inProgress = true;
        this.server.ticker.addListener('tick', this._tickBound);
        this._delaySpawnPowerup();
    },

    destruct: function() {
        var ticker = this.server.ticker;

        if (ticker.listeners('tick')) {
            ticker.removeListener('tick', this._tickBound);
        }

        clearTimeout(this._gameStartTimer);
        clearTimeout(this._powerUpTimer);

        delete this.snakes;
        delete this.apples;
        delete this.powerups;
        delete this.level;
    },

    /**
     * @param {Client} client
     * @param {Array.<Array>} parts
     * @param {number} direction
     */
    updateSnake: function(client, parts, direction) {
        var apple, powerup, head = parts[parts.length - 1];

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
            this._hitApple(client, apple);
        }

        powerup = this._powerupAtPosition(head);
        if (-1 !== powerup) {
            this._hitPowerup(client, powerup);
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
     * @private
     */
    _delaySpawnPowerup: function() {
        var i = config.server.spawnInterval;
        clearTimeout(this._powerUpTimer);
        this._powerUpTimer = setTimeout(function() {
            this.spawnPowerup(this.powerups.length);
            this._delaySpawnPowerup();
        }.bind(this), myutil.randomBetween(i[0] * 1000, i[1]* 1000));
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
     * @return {Array.<number>}
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
            if (m >= 5 && m - 1 !== i && !level.gap(part, parts[m - 1])) {
                return [this.CRASH_SELF, clients.indexOf(client)];
            }

            // Self (limbo)
            else if (limbo && m >= 5 && m - 2 !== i && !level.gap(part, parts[m - 2])) {
                return [this.CRASH_SELF, clients.indexOf(client)];
            }

            // Opponent
            for (var ii = 0, mm = clients.length; ii < mm; ii++) {
                if (client !== clients[ii]) {
                    if (clients[ii].snake.hasPart(part)) {
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
        this.server.ticker.removeListener('tick', this._tickBound);
        this.room.newRound();
    },

    /**
     * @param {Array.<number>} position
     * @return {number}
     * @private
     */
    _appleAtPosition: function(position) {
        for (var i = 0, m = this.apples.length; i < m; i++) {
            if (this.apples[i]) {
                if (this.level.gap(this.apples[i], position) === 0) {
                    return i;
                }
            }
        }
        return -1;
    },

    /**
     * @param {Client} client
     * @param {number} appleIndex
     * @private
     */
    _hitApple: function(client, appleIndex) {
        var size = client.snake.size += 3,
            clientIndex = this.room.clients.indexOf(client),
            score = ++this.room.points[clientIndex];

        this.room.emit(events.CLIENT_APPLE_HIT, [clientIndex, size, appleIndex]);
        this.room.emit(events.CLIENT_SNAKE_ACTION, [clientIndex, 'nom']);
        this.room.emit(events.CLIENT_ROOM_SCORE, [clientIndex, score]);

        if (appleIndex === 0) {
            this.spawnApple(0);
        } else {
            this.apples[appleIndex] = null;
        }
    },

    /**
     * @param {Array.<number>} position
     * @return {number}
     * @private
     */
    _powerupAtPosition: function(position) {
        for (var i = 0, m = this.powerups.length; i < m; i++) {
            if (this.powerups[i]) {
                if (this.level.gap(this.powerups[i].location, position) === 0) {
                    return i;
                }
            }
        }
        return -1;
    },

    /**
     * @param {Client} client
     * @param {number} powerupIndex
     * @private
     */
    _hitPowerup: function(client, powerupIndex) {
        var clientIndex = this.room.clients.indexOf(client),
            powerup = this.powerups[powerupIndex];
        powerup.hit(client, this);
        this.room.emit(events.CLIENT_POWERUP_HIT, [clientIndex, powerupIndex]);
        this.powerups[powerupIndex] = null;
    },

    /**
     * @param {number} index
     */
    spawnPowerup: function(index) {
        var location, powerup;
        location = this.level.getRandomOpenTile(this.snakes);
        powerup = new Powerup(location);
        this.powerups[index] = powerup;
        this.room.emit(events.CLIENT_POWERUP_SPAWN, [index, location]);
    },

    /**
     * @param {number} index
     */
    spawnApple: function(index) {
        var location = this.level.getRandomOpenTile(this.snakes);
        this.apples[index] = location;
        this.room.emit(events.CLIENT_APPLE_SPAWN, [index, location]);
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
        var predict, apple, powerup, snake, clone, crash;

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
        apple = this._appleAtPosition(predict);
        if (-1 !== apple) {
            this._hitApple(client, apple);
        }

        // Powerup?
        powerup = this._powerupAtPosition(predict);
        if (-1 !== powerup) {
            this._hitPowerup(client, powerup);
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
        size = config.shared.snake.size;
        speed = config.shared.snake.speed;

        snake = new Snake(spawn, direction, size, speed);
        snake.elapsed = 0;

        return snake;
    }

};