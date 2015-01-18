'use strict';

/***
 * Game
 * @param {xss.level.Level} level
 * @param {xss.room.ServerPlayerRegistry} players
 * @constructor
 */
xss.game.ServerGame = function(level, players) {
    this.level = level;
    this.players = players;
    this.items = new xss.game.ServerItems(level, players);
    this.prevtick = +new Date();

    this.players.setSnakes(this.level);

    this.tick();
    this.tickInterval = setInterval(this.tick.bind(this), xss.SERVER_TICK_INTERVAL);
};

xss.game.ServerGame.prototype = {

    destruct: function() {
        clearInterval(this.tickInterval);
        this.items.destruct();
        this.level = null;
        this.players = null;
        this.items = null;
    },

    tick: function() {
        var now = +new Date();
        this.gameloop(now - this.prevtick);
        this.prevtick = now;
    },

    gameloop: function(elapsed) {
        var shift = this.level.gravity.getShift(elapsed);
        this.level.animations.update(elapsed, this.started);
        this.players.moveSnakes(elapsed, shift);
    }

};
