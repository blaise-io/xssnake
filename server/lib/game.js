/*jshint globalstrict:true,es5:true*/
'use strict';

var Level = require('../shared/level.js'),
    levels = require('../shared/levels.js'),
    Snake = require('../shared/snake.js'),
    config = require('../shared/config.js'),
    event = require('../shared/event.js');

/**
 * @param {Room} room
 * @constructor
 */
function Game(room, levelID) {
    this.room = room;
    this.server = room.server;

    this.level = new Level(levelID, levels);
    this.levelID = levelID;

    this.apples = [this.level.getRandomOpenTile()];
    this.snakes = new Array(this.room.clients.length);

    this._roundEnded = false;
    this._tickListener = this._tick.bind(this);
    this._setupClients();
}

module.exports = Game;

Game.prototype = {

    start: function() {
        console.log('___[NEW ROUND]___');
        this.server.ticker.on('tick', this._tickListener);
        this.room.emit(event.CLIENT_GAME_START, []);
    },

    /**
     * @param {Client} client
     * @param {Array.<Array>} parts
     * @param {number} direction
     */
    updateSnake: function(client, parts, direction) {
        var head, appleIndex;

        head = parts[parts.length - 1];

        if (this._isCrash(client, parts)) {
            this._setSnakeCrashed(client, parts);
        }

        appleIndex = this._appleAtPosition(head);
        if (-1 !== appleIndex) {
            this._eatApple(client, appleIndex);
        }

        client.snake.direction = direction;

        if (this.level.gap(head, client.snake.head()) <= 1) {
            client.snake.parts = parts;
            this._broadCastSnake(client);
        } else {
            console.log(client.name);
            console.log(head);
            console.log(client.snake.head());
            this._rejectClientState(client);
        }

        return true;
    },

    /**
     * @param {Client} client
     * @private
     */
    _rejectClientState: function(client) {
        var send = [
            this.room.clients.indexOf(client),
            client.snake.parts,
            client.snake.direction
        ];
        this.room.emit(event.CLIENT_SNAKE_UPDATE, send);
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
        this.room.broadcast(event.CLIENT_SNAKE_UPDATE, send, client);
    },

    /**
     * @param {Client} client
     * @param {Array.<Array>} parts
     * @return {string=}
     * @private
     */
    _isCrash: function(client, parts) {
        var clients = this.room.clients,
            level = this.level;

        for (var i = 0, m = parts.length; i < m; i++) {
            var part = parts[i];

            // Wall
            if (level.isWall(part[0], part[1])) {
                console.log(client.name + ' crashed into wall with part', i);
                return 'wall';
            }

            // Self
            else if (i !== 0 && !level.gap(part, parts[0])) {
                console.log(part, parts[0], !this.level.gap(part, parts[0]));
                console.log(client.name + ' crashed into self', i);
                return 'self';
            }

            // Opponent
            else {
                for (var ii = 0, mm = clients.length; ii < mm; ii++) {
                    var opponent = clients[ii];
                    if (client !== opponent) {
                        if (-1 !== opponent.snake.partIndex(part)) {
                            console.log(client.name + ' crashed into ' +
                                'opponent ' + opponent.name + ' with part', i);
                            return 'opponent';
                        }
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
        this.room.emit(event.CLIENT_SNAKE_CRASH, [clientIndex, parts]);
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

        console.log(winner.name + ' won');
        if (winner) {
            this.room.emit(event.CLIENT_GAME_WIN, [winner.name, ++winner.wins]);
        }

        setTimeout(this._startNewRound.bind(this), 4000);
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
        var size = ++client.snake.size;
        var clientIndex = this.room.clients.indexOf(client);
        this.room.emit(event.CLIENT_APPLE_NOM, [clientIndex, size, appleIndex]);
        this._respawnApple(appleIndex);
    },

    /**
     * @param {number} appleIndex
     * @private
     */
    _respawnApple: function(appleIndex) {
        var location = this.level.getRandomOpenTile();
        this.apples[appleIndex] = location;
        this.room.emit(event.CLIENT_APPLE_SPAWN, [appleIndex, location]);
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
        var predict, appleIndex, snake, clone;

        snake = client.snake;
        predict = this._getPredictPosition(snake);

        // Crash?
        clone = snake.parts.slice(1);
        clone.push(predict);
        if (this._isCrash(client, clone)) {
            this._setSnakeCrashed(client, snake.parts);
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
     * @private
     */
    _setupClients: function() {
        var clients = this.room.clients;
        var names = this.room.names();
        this.apple = this.level.getRandomOpenTile();
        for (var i = 0, m = clients.length; i < m; i++) {
            var snake = this._spawnClientSnake(i);
            this.snakes[i] = snake;
            clients[i].snake = snake;
            this._emitGameSetup(i, names);
        }
        setTimeout(this.start.bind(this), 2000);
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

        snake = new Snake(index, spawn, direction, size, speed);
        snake.elapsed = 0;

        return snake;
    },

    /**
     * @param {number} index
     * @param {Array.<string>} names
     * @private
     */
    _emitGameSetup: function(index, names) {
        var data = [this.levelID, names, index, this.apples];
        this.room.clients[index].emit(event.CLIENT_GAME_SETUP, data);
    }

};