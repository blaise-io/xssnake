'use strict';

/**
 * @param {number} index
 * @param {xss.level.Level} level
 * @extends {xss.game.Snake}
 * @constructor
 */
xss.game.ServerSnake = function(index, level) {
    xss.game.Snake.call(this, index, level);
    this.index = index;
    this.level = level;
    this.elapsed = 0;
    this.limbo = false;
};

/** @lends {xss.game.ClientSnake.prototype} */
xss.util.extend(xss.game.ServerSnake.prototype, xss.game.Snake.prototype);
xss.util.extend(xss.game.ServerSnake.prototype, /** @lends xss.game.ServerSnake.prototype */ {

    destruct: function() {
        this.level = null;
    },

    move: function(coordinate) {
        if (this.controls) {
            this.controls.move();
        }
        xss.game.Snake.prototype.move.call(this, coordinate);
    },

    /**
     * @param {number} elapsed
     * @param shift
     * @param {Array.<xss.room.Player>} players
     */
    handleNextMove: function(elapsed, shift, players) {
        this.elapsed += elapsed;

        //if (!this.crashed && this.elapsed >= this.speed) {
        //    var move = new xss.game.SnakeMove(
        //        this, players, this.level, this.getNextPosition()
        //    );
        //
        //    this.elapsed -= this.speed;
        //
        //    // Don't show a snake moving inside a wall, which is caused by latency.
        //    // Server wil issue a final verdict whether the snake truly crashed, or
        //    // made a turn in time.
        //    if (move.collision) {
        //        if (this.local) {
        //            this.crash(move.collision.location);
        //        } else {
        //            this.limbo = move.collision;
        //        }
        //    } else if (!this.limbo) {
        //        this.move(move.location);
        //        this.updateShape();
        //    }
        //}
    },

    /**
     * @param {xss.Coordinate=} part
     */
    crash: function(part) {
        this.crashed = true;
    },

    /**
     * @param {number} direction
     */
    emit: function(direction) {
    },

    /**
     * @return {xss.Coordinate}
     */
    getNextPosition: function() {
        var shift, head = this.getHead();
        shift = xss.GAME_SHIFT_MAP[this.direction];
        return [head[0] + shift[0], head[1] + shift[1]];
    }

});
