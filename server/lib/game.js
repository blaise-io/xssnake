/*jshint globalstrict:true,es5:true*/
'use strict';

var Level = require('../shared/level.js'),
    levels = require('../shared/levels.js'),
    Snake = require('../shared/snake.js'),
    config = require('../shared/config.js');

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
    this._setupClients();
}

module.exports = Game;

Game.prototype = {

    start: function() {
        this.inprogress = true;
        this.server.ticker.on('tick', this._tick.bind(this));
        this.room.emit('/client/game/start', []);
    },

    /**
     * @param {Client} client
     * @param {Array.Array} parts
     * @param {number} direction
     */
    updateSnake: function(client, parts, direction) {
        var head, appleIndex;

        head = parts[parts.length - 1];

        if (this.isCrash(parts)) {
            this.setSnakeCrashed(client, parts);
        }

        appleIndex = this.appleAtPosition(head);
        if (-1 !== appleIndex) {
            this.eatApple(client, appleIndex);
        }

        if (this.level.gap(head, client.snake.head()) !== 0) {
            this.parts = parts;
        }
        this.direction = direction;

        this.broadCastSnake(client);
    },

    broadCastSnake: function(client) {
        var send = [
            this.room.clients.indexOf(client),
            client.snake.parts,
            client.snake.direction
        ];
        this.room.broadcast('/client/snake/update', send, client);
    },

    isCrash: function(parts) {
        // Wall
        var checkParts = Math.max(parts.length - 5, 0); // TODO: config
        for (var i = checkParts, m = parts.length; i < m; i++) {
            if (this.level.isWall(parts[i][0], parts[i][1])) {
                return true;
            }
        }

        // Todo: Self

        // Todo: Player

        return false;
    },

    setSnakeCrashed: function(client, parts) {
        client.snake.crashed = true;
        var clientIndex = this.room.clients.indexOf(client);
        this.room.emit('/client/snake/crash', [clientIndex, parts]);
    },

    appleAtPosition: function(position) {
        for (var i = 0, m = this.apples.length; i < m; i++) {
            if (this.level.gap(this.apples[i], position) === 0) {
                return i;
            }
        }
        return -1;
    },

    eatApple: function(client, appleIndex) {
        var size = ++client.snake.size;
        var clientIndex = this.room.clients.indexOf(client);
        this.room.emit('/client/apple/eat', [clientIndex, size, appleIndex]);
        this.respawnApple(appleIndex);
    },

    respawnApple: function(appleIndex) {
        var location = this.level.getRandomOpenTile();
        this.apples[appleIndex] = location;
        this.room.emit('/client/apple/spawn', [appleIndex, location]);
    },

    /**
     * @param {number} delta
     * @private
     */
    _tick: function(delta) {
        for (var i = 0, m = this.snakes.length; i < m; i++) {
            var snake = this.snakes[i];
            if (!snake.crashed) {
                snake.elapsed += delta;
                if (snake.elapsed >= snake.speed) {
                    snake.elapsed -= snake.speed;
                    this._setSnakePredictPosition(snake);
                    snake.trim();
                }
            }
        }
    },

    _setSnakePredictPosition: function(snake) {
        var head, shift, predict, appleIndex, client;

        head = snake.head();
        shift = [[-1, 0], [0, -1], [1, 0], [0, 1]][snake.direction];
        predict = [head[0] + shift[0], head[1] + shift[1]];
        snake.parts.push(predict);

        client = this.room.clients[snake.index];

        // Wall? TODO: Grace period
        if (this.isCrash(snake.parts)) {
            this.setSnakeCrashed(client, snake.parts);
        }

        // Apple?
        appleIndex = this.appleAtPosition(predict);
        if (-1 !== appleIndex) {
            this.eatApple(appleIndex, client);
        }
    },

    _setupClients: function() {
        var names = this.room.names();
        this.apple = this.level.getRandomOpenTile();
        for (var i = 0, m = this.room.clients.length; i < m; i++) {
            var snake = this._spawnClientSnake(i);
            this.snakes[i] = snake;
            this.room.clients[i].snake = snake;
            this._emitGameSetup(i, names);
        }
        setTimeout(this.start.bind(this), 2000);
    },

    _spawnClientSnake: function(index) {
        var spawn, direction, snake, size, speed;

        spawn = this.level.getSpawn(index);
        direction = this.level.getSpawnDirection(index);
        size = config.snake.size;
        speed = config.snake.speed;

        snake = new Snake(index, spawn, direction, size, speed);
        snake.elapsed = 0;

        return snake;
    },

    _emitGameSetup: function(index, names) {
        var data = [this.levelID, names, index, this.apples];
        this.room.clients[index].emit('/client/game/setup', data);
    }

};