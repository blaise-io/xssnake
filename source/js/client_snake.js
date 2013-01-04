/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Shape, Snake, Util*/
'use strict';

/**
 * @param {number} index
 * @param {boolean} local
 * @param {string} name
 * @param {Array.<number>} location
 * @param {number} direction
 * @extends {Snake}
 * @constructor
 */
function ClientSnake(index, local, name, location, direction) {
    var size, speed;

    size  = XSS.config.shared.snake.size;
    speed = XSS.config.shared.snake.speed;

    Snake.call(this, location, direction, size, speed);

    this.local   = local;
    this.name    = name;
    this.elapsed = 0;
    this.limbo   = false;

    this._shape = new Shape();
    this._shape.dynamic = true;

    /**
     * @type {Array}
     * @private
     */
    this._snakeTurnRequests = [];

    /** @type {Object.<string,string>} */
    this.shapes = {
        snake    : 'S'  + index, // Snake
        name     : 'SN' + index, // Snake name tag
        direction: 'SD' + index  // Snake direction
    };
}

ClientSnake.prototype = Object.create(Snake.prototype);

/** @lends {ClientSnake.prototype} */
Util.extend(ClientSnake.prototype, {

    destruct: function() {
        this.removeControls();
        for (var k in this.shapes) {
            if (this.shapes.hasOwnProperty(k)) {
                delete XSS.shapes[this.shapes[k]];
            }
        }
    },

    showName: function() {
        var x, y, shape;

        x = this.parts[0][0] * 4;
        y = this.parts[0][1] * 4;

        switch (this.direction) {
            case 0: y +=  4; x -=  4; break;
            case 1: y -=  4; x +=  4; break;
            case 2: y +=  4; x += 10; break;
            case 3: y += 10; x +=  4; break;
        }

        shape = XSS.shapegen.tooltip(this.name, x, y, this.direction);
        XSS.shapes[this.shapes.name] = shape;
    },

    /**
     * @param {string} label
     * @param {number=} duration
     * @param {number=} amount
     */
    showAction: function(label, duration, amount) {
        duration = duration || 100;
        amount = amount || 3;

        var rand = function() {
            return Util.randomBetween(-12, 12);
        };

        for (var i = 0; i <= duration * amount; i += duration) {
            var shape, name, h = this.head();
            shape = XSS.font.shape(label, h[0] * 4 + rand(), h[1] * 4 + rand());
            shape.clear = true;
            name = 'AL_' + Util.randomStr();
            XSS.shapes[name] = shape.lifetime(i, duration + i, true);
        }
    },

    showDirection: function() {
        var shift, head, pixels, shape;
        shift = this.directionToShift(this.direction);
        head = this.head();
        pixels = [
            [head[0] + shift[0], head[1] + shift[1]]
        ];
        shape = new Shape(XSS.transform.zoomGame(pixels));
        shape.flash(XSS.FLASH_FAST);
        XSS.shapes[this.shapes.direction] = shape;
    },

    removeNameAndDirection: function() {
        delete XSS.shapes[this.shapes.name];
        delete XSS.shapes[this.shapes.direction];
    },

    addControls: function() {
        this._SnakeKeysBound = this._snakeKeys.bind(this);
        XSS.on.keydown(this._SnakeKeysBound);
    },

    removeControls: function() {
        if (this.local && this._SnakeKeysBound) {
            XSS.off.keydown(this._SnakeKeysBound);
        }
    },

    addToEntities: function() {
        XSS.shapes[this.shapes.snake] = this.updateShape();
    },

    /**
     * @return {Shape}
     */
    updateShape: function() {
        this._shape.pixels = XSS.transform.zoomGame(this.parts);
        return this._shape;
    },

    crash: function() {
        this.crashed = true;
        this.removeControls();
        this.updateShape();
    },

    emitState: function(direction) {
        XSS.socket.emit(XSS.events.SERVER_SNAKE_UPDATE, [this.parts, direction]);
    },

    /** @private */
    applyCachedDirection: function() {
        if (this._snakeTurnRequests.length) {
            this.direction = this._snakeTurnRequests.shift();
        }
    },

    /**
     * @return {Array.<number>}
     */
    getNextPosition: function() {
        var shift, head = this.head();
        this.applyCachedDirection();
        shift = this.directionToShift(this.direction);
        return [head[0] + shift[0], head[1] + shift[1]];
    },

    /**
     * @param {Event} e
     * @private
     */
    _snakeKeys: function(e) {
        switch (e.which) {
            case XSS.KEY_LEFT:
                this._changeDirection(XSS.DIRECTION_LEFT);
                break;
            case XSS.KEY_UP:
                this._changeDirection(XSS.DIRECTION_UP);
                break;
            case XSS.KEY_RIGHT:
                this._changeDirection(XSS.DIRECTION_RIGHT);
                break;
            case XSS.KEY_DOWN:
                this._changeDirection(XSS.DIRECTION_DOWN);
                break;
        }
    },

    /**
     * @param {number} direction
     * @private
     */
    _changeDirection: function(direction) {
        var lastDirection, turns;

        // Allow max of 2 turn requests in 1 move
        if (this._snakeTurnRequests.length <= 2) {
            lastDirection = this._getLastDirection();
            turns = Math.abs(direction - lastDirection);
            if (direction !== lastDirection && this._isNumTurnAllowed(turns)) {
                this._snakeTurnRequests.push(direction);

                // Send to server
                if (this._snakeTurnRequests.length === 1) {
                    this.emitState(direction);
                } else {
                    // Wait a bit before sending this
                    setTimeout(function() {
                        this.emitState(direction);
                    }.bind(this), this.speed - 20);
                }
            }
        }
    },

    /**
     * @return {number}
     * @private
     */
    _getLastDirection: function() {
        return (this._snakeTurnRequests.length) ?
            this._snakeTurnRequests[0] :
            this.direction;
    },

    /**
     * @param {number} turns
     * @private
     */
    _isNumTurnAllowed: function(turns) {
        // Disallow 0: no turn, 2: bumping into torso
        return turns === 1 || turns === 3;
    }

});