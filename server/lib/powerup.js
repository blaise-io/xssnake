/*jshint globalstrict:true, es5:true, node:true*/
'use strict';

var events = require('../shared/events.js');

/**
 * Powerup
 * @param {Array.<number>} location
 * @constructor
 */
function Powerup(location) {
    this.location = location;
}

module.exports = Powerup;

/** @const */ Powerup.APPLY_SELF = 0;
/** @const */ Powerup.APPLY_OTHERS = 1;
/** @const */ Powerup.APPLY_EITHER = 2;
/** @const */ Powerup.APPLY_ALL = 3;

Powerup.prototype = {

    hit: function(client, game) {
        var x = Math.random() * 100;
        if (x < 10) {
            return this._speedIncrease(client, game);
        } else {
            return this._spawnApples(client, game);
        }
    },

    _speedIncrease: function(client, game) {
        var index = game.room.clients.indexOf(client);
        client.snake.speed -= 5;
        game.room.emit(events.CLIENT_SNAKE_SPEED, [index, client.snake.speed]);
        game.room.emit(events.CLIENT_SNAKE_ACTION, [index, 'speedup']);
    },

    _spawnApples: function(client, game) {
        var index, spawnApple;

        index = game.room.clients.indexOf(client);
        spawnApple = function() {
            game.spawnApple(game.apples.length);
        };

        game.room.emit(events.CLIENT_SNAKE_ACTION, [index, 'apple rain']);

        for (var i = 0, m = 2 + Math.random() * 4; i < m; i++) {
            setTimeout(spawnApple.bind(i), i * 50);
        }
    }

};