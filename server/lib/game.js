/*jshint globalstrict:true,es5:true*/
'use strict';

var Level = require('../shared/level.js'),
    levels = require('../shared/levels.js'),
    Snake = require('./snake.js');

/**
 * @param {Room} room
 * @constructor
 */
function Game(room, levelID) {
    this.room = room;
    this.levelID = levelID;
    this.level = new Level(this.levelID, levels);
    this._setupClients();
}

module.exports = Game;

Game.prototype = {

    start: function() {
        this.inprogress = true;
    },

    respawnApple: function() {
        this.apple = this.level.getRandomOpenTile();
        this.emit('/client/apple/spawn', [0, this.apple]);
    },

    _setupClients: function() {
        var names = this.room.names();
        this.apple = this.level.getRandomOpenTile();
        for (var i = 0, m = this.room.clients.length; i < m; i++) {
            this._spawnClientSnake(i);
            this._emitGameSetup(i, names);
        }
    },

    _spawnClientSnake: function(index) {
        var spawn, direction, snake;
        spawn = this.level.getSpawn(index);
        direction = this.level.getSpawnDirection(index);
        snake = new Snake(this, index, spawn, direction);
        this.room.clients[index].snake = snake;
    },

    _emitGameSetup: function(index, names) {
        var data = [this.levelID, names, index];
        this.room.clients[index].emit('/client/game/setup', data);
        this._startAfterDelay(2000);
    },

    // TODO: Check if everyone still there
    _startAfterDelay: function(delay) {
        setTimeout(function() {
            this.room.emit('/client/game/start', []);
        }.bind(this), delay);
    }

};