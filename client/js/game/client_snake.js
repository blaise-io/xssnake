'use strict';

/**
 * @param {number} index
 * @param {boolean} local
 * @param {string} name
 * @param {xss.level.Level} level
 * @extends {xss.game.Snake}
 * @constructor
 * @todo offload logic to other classes
 */
xss.game.ClientSnake = function(index, local, name, level) {
    xss.game.Snake.call(this, index, level);

    this.index   = index;
    this.local   = local;
    this.name    = name;
    this.level   = level;
    this.elapsed = 0;
    this.limbo   = false;

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
xss.util.extend(xss.game.ClientSnake.prototype, xss.game.Snake.prototype);
xss.util.extend(xss.game.ClientSnake.prototype, /** @lends xss.game.ClientSnake.prototype */ {

    destruct: function() {
        this.crash();
        this.controls.destruct();

        for (var k in this.shapeKeys) {
            if (this.shapeKeys.hasOwnProperty(k)) {
                xss.shapes[this.shapeKeys[k]] = null;
            }
        }
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

    updateShape: function() {
        var shape = new xss.Shape();
        shape.pixels.addPairs(this.parts);
        shape.setGameTransform();
        xss.shapes[this.shapeKeys.snake] = shape;
    },

    /**
     * @param {number} delta
     * @param shift
     * @param {Array.<xss.game.ClientSnake>} snakes
     */
    handleNextMove: function(delta, shift, snakes) {
        this.elapsed += delta;

        if (!this.crashed && this.elapsed >= this.speed) {
            var move = new xss.game.SnakeMove(
                this, snakes, this.level, this.getNextPosition()
            );

            this.elapsed -= this.speed;

            // Don't show a snake moving inside a wall, which is caused by latency.
            // Server wil issue a final verdict whether the snake truly crashed, or
            // made a turn in time.
            if (move.collision) {
                if (this.local) {
                    this.crash(move.collision.location);
                } else {
                    this.limbo = move.collision;
                }
            } else if (!this.limbo) {
                this.move(move.location);
                this.updateShape();
            }
        }
    },

    /**
     * @param {xss.Coordinate=} part
     */
    crash: function(part) {
        this.crashed = true;
        this.controls.destruct();
        this.updateShape();
        if (!this._exploded) {
            this._exploded = true;
            this.explodeParticles(part);
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
     * @param {number} direction
     */
    emit: function(direction) {
        if (xss.socket) {
            // @todo: Check if in room?
            var data, sync;
            sync = Math.round(xss.NETCODE_SYNC_MS / this.speed);
            data = [this.parts.slice(-sync), direction];
            xss.socket.emit(xss.EVENT_SNAKE_UPDATE, data);
        }
    },

    /**
     * @return {xss.Coordinate}
     */
    getNextPosition: function() {
        var shift, head = this.getHead();
        this.direction = this.controls.getNextDirection();
        shift = xss.GAME_SHIFT_MAP[this.direction];
        return [head[0] + shift[0], head[1] + shift[1]];
    }

});