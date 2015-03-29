'use strict';

/**
 * @param {number} index
 * @param {boolean} local
 * @param {string} name
 * @param {xss.level.Level} level
 * @extends {xss.game.Snake}
 * @constructor
 */
xss.game.ClientSnake = function(index, local, name, level) {
    xss.game.Snake.call(this, index, level);

    this.index = index;
    this.local = local;
    this.name = name;
    this.elapsed = 0;
    this.exploded = false;

    /** @type {xss.game.ClientSnakeControls} */
    this.controls = null;

    /** @type {Object.<string,string>} */
    this.shapeKeys = {
        snake    : xss.NS_SNAKE + index,
        name     : xss.NS_SNAKE + 'TAG' + index,
        direction: xss.NS_SNAKE + 'DIR' + index
    };

    this.updateShape();
};

/** @lends {xss.game.ClientSnake.prototype} */
xss.extend(xss.game.ClientSnake.prototype, xss.game.Snake.prototype);
xss.extend(xss.game.ClientSnake.prototype, /** @lends {xss.game.ClientSnake.prototype} */ {

    destruct: function() {
        // Remove any related shape.
        var keys = Object.keys(this.shapeKeys);
        for (var i = 0, m = keys.length; i < m; i++) {
            var shapeKey = this.shapeKeys[keys[i]];
            xss.shapes[shapeKey] = null;
        }

        if (this.controls) {
            this.controls.destruct();
            this.controls = null;
        }

        this.level = null;
    },

    move: function(coordinate) {
        if (this.controls) {
            this.controls.move();
        }
        xss.game.Snake.prototype.move.call(this, coordinate);
    },

    getShape: function() {
        return xss.shapes[this.shapeKeys.snake];
    },

    showName: function() {
        xss.shapes[this.shapeKeys.name] = xss.shapegen.tooltipName(
            this.name, this.parts[0], this.direction
        );
    },

    showAction: function(label) {
        xss.shapegen.showAction(label, this.getHead(), this.speed);
    },

    showDirection: function() {
        var shift, head, shape;
        shift = xss.GAME_SHIFT_MAP[this.direction];
        head = this.getHead();

        shape = new xss.Shape();
        shape.pixels.add(head[0] + shift[0], head[1] + shift[1]);
        shape.setGameTransform();
        shape.flash();

        xss.shapes[this.shapeKeys.direction] = shape;
    },

    removeNameAndDirection: function() {
        xss.shapes[this.shapeKeys.name] = null;
        xss.shapes[this.shapeKeys.direction] = null;
    },

    addControls: function() {
        this.controls = new xss.game.ClientSnakeControls(this);
    },

    /**
     * @return {xss.Shape}
     */
    updateShape: function() {
        var shape = new xss.Shape();
        shape.pixels.addPairs(this.parts);
        shape.setGameTransform();
        xss.shapes[this.shapeKeys.snake] = shape;
        return shape;
    },

    /**
     * @param {xss.level.Level} level
     * @param {number} elapsed
     * @param shift
     * @param {Array.<xss.room.Player>} players
     */
    handleNextMove: function(level, elapsed, shift, players) {
        this.elapsed += elapsed;

        if (!this.crashed && this.elapsed >= this.speed) {
            var move = new xss.game.SnakeMove(
                this, players, level, this.getNextPosition()
            );

            this.elapsed -= this.speed;

            // Don't show a snake moving inside a wall, which is caused by latency.
            // Server wil issue a final verdict whether the snake truly crashed, or
            // made a turn in time.
            if (move.collision) {
                if (this.local) {
                    this.setCrashed(move.collision.location);
                } else {
                    this.collision = move.collision;
                }
            } else if (!this.collision) {
                this.move(move.location);
                this.updateShape();
            }
        }
    },

    /**
     * @param {xss.Coordinate=} crashingPart
     */
    setCrashed: function(crashingPart) {
        this.crashed = true;
        if (this.controls) {
            this.controls.destruct();
        }
        if (!this.exploded) {
            this.exploded = true;
            this.explodeParticles(crashingPart);
            this.updateShape().lifetime(0, xss.FRAME * 50).flash(xss.FRAME * 5, xss.FRAME * 10);
        }
    },

    /**
     * @param {xss.Coordinate=} part
     */
    explodeParticles: function(part) {
        var direction, location;

        if (part) {
            // Crashed part is specified.
            direction = -1;
        } else {
            // Assume head has crashed.
            direction = this.direction;
            part = this.getHead();
        }

        location = xss.util.translateGame(part);
        location[0] += 1;
        location[1] += 2;

        xss.shapegen.explosion(location, direction);
    },

    /**
     * @param {Array} serializedSnake
     */
    deserialize: function(serializedSnake) {
        this.direction = serializedSnake[0];
        this.parts = serializedSnake[1];
        // If server updated snake, client prediction
        // of snake crashing was incorrect.
        this.collision = null;
    },

    /**
     * @param {number} direction
     */
    emit: function(direction) {
        if (xss.player) {
            var sync = Math.round(xss.NETCODE_SYNC_MS / this.speed);
            xss.player.emit(xss.NC_SNAKE_UPDATE, [
                direction, this.parts.slice(-sync)
            ]);
        }
    },

    /**
     * @return {xss.Coordinate}
     */
    getNextPosition: function() {
        var shift, head = this.getHead();
        if (this.controls) {
            this.direction = this.controls.getNextDirection();
        }
        shift = xss.GAME_SHIFT_MAP[this.direction];
        return [head[0] + shift[0], head[1] + shift[1]];
    }

});
