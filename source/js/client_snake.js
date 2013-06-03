/*jshint globalstrict:true, es5:true, expr:true, sub:true*/
/*globals XSS, CONST, Shape, ShapePixels, Snake*/
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

    size  = CONST.SNAKE_SIZE;
    speed = CONST.SNAKE_SPEED;

    Snake.call(this, location, direction, size, speed);

    this.index   = index;
    this.local   = local;
    this.name    = name;
    this.elapsed = 0;
    this.limbo   = false;

    this._shape = new Shape();

    /**
     * @type {Array}
     * @private
     */
    this._snakeTurnCache = [];

    /** @type {Object.<string,string>} */
    this.shapes = {
        snake    : CONST.NS_SNAKE + index,
        name     : CONST.NS_SNAKE + 'TAG' + index,
        direction: CONST.NS_SNAKE + 'DIR' + index
    };
}

/** @lends {ClientSnake.prototype} */
XSS.util.extend(ClientSnake.prototype, Snake.prototype);
XSS.util.extend(ClientSnake.prototype, /** @lends ClientSnake.prototype */ {

    destruct: function() {
        this.crash();
        for (var k in this.shapes) {
            if (this.shapes.hasOwnProperty(k)) {
                XSS.shapes[this.shapes[k]] = null;
            }
        }
    },

    getShape: function() {
        return XSS.shapes[this.shapes.snake];
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
        duration = duration || this.speed;
        amount = amount || 3;

        var rand = function() {
            return XSS.util.randomRange(-12, 12);
        };

        for (var i = 0; i <= duration * amount; i += duration) {
            var shape, name, h = this.head();
            shape = XSS.font.shape(label, h[0] * 4 + rand(), h[1] * 4 + rand());
            name = CONST.NS_SNAKE + XSS.util.randomStr();
            XSS.shapes[name] = shape.lifetime(i, duration + i);
        }
    },

    showDirection: function() {
        var shift, head, pixels, shape;
        shift = this.directionToShift(this.direction);
        head = this.head();

        pixels = new ShapePixels();
        pixels.add(head[0] + shift[0], head[1] + shift[1]);
        pixels = XSS.transform.zoomGame(pixels);

        shape = new Shape(pixels);
        shape.flash();

        XSS.shapes[this.shapes.direction] = shape;
    },

    removeNameAndDirection: function() {
        XSS.shapes[this.shapes.name] = null;
        XSS.shapes[this.shapes.direction] = null;
    },

    addControls: function() {
        XSS.event.on(CONST.EVENT_KEYDOWN, CONST.NS_SNAKE, this._handleKeys.bind(this));
    },

    removeControls: function() {
        XSS.event.off(CONST.EVENT_KEYDOWN, CONST.NS_SNAKE);
    },

    addToShapes: function() {
        XSS.shapes[this.shapes.snake] = this.updateShape();
    },

    /**
     * @return {Shape}
     */
    updateShape: function() {
        var pixels = new ShapePixels();
        pixels.pairs(this.parts);
        pixels = XSS.transform.zoomGame(pixels);
        return this._shape.set(pixels);
    },

    crash: function() {
        this.crashed = true;
        this.removeControls();
        this.updateShape();
        this.explodeParticles();
    },

    explodeParticles: function() {
        var x, y, head = this.head();
        x = head[0] * CONST.GAME_TILE + CONST.GAME_LEFT;
        y = head[1] * CONST.GAME_TILE + CONST.GAME_TOP;
        if (!this._exploded) {
            this._exploded = true;
            XSS.shapegen.explosion(
                x + XSS.util.randomRange(0,3),
                y + XSS.util.randomRange(0,3),
                this.direction, 16
            );
        }
    },

    /**
     * @param {number} direction
     * @private
     */
    _emitSnake: function(direction) {
        var data, sync;
        sync = Math.round(CONST.NETCODE_SYNC_MS / this.speed);
        data = [this.parts.slice(-sync), direction];
        XSS.socket.emit(CONST.EVENT_SNAKE_UPDATE, data);
    },

    /** @private */
    _applyCachedDirection: function() {
        if (this._snakeTurnCache.length) {
            this.direction = this._snakeTurnCache.shift();
        }
    },

    /**
     * @return {Array.<number>}
     */
    getNextPosition: function() {
        var shift, head = this.head();
        this._applyCachedDirection();
        shift = this.directionToShift(this.direction);
        return [head[0] + shift[0], head[1] + shift[1]];
    },

    /**
     * @param {Event} e
     * @private
     */
    _handleKeys: function(e) {
        if (XSS.keysBlocked) {
            return;
        }
        switch (e.keyCode) {
            case CONST.KEY_LEFT:
                this._changeDirection(CONST.DIRECTION_LEFT);
                break;
            case CONST.KEY_UP:
                this._changeDirection(CONST.DIRECTION_UP);
                break;
            case CONST.KEY_RIGHT:
                this._changeDirection(CONST.DIRECTION_RIGHT);
                break;
            case CONST.KEY_DOWN:
                this._changeDirection(CONST.DIRECTION_DOWN);
                break;
        }
    },

    /**
     * @param {number} direction
     * @private
     */
    _changeDirection: function(direction) {
        var allowed = this._isTurnAllowed(direction, this._getPrevDirection());
        if (this._snakeTurnCache.length <= 2 && allowed) {
            this._snakeTurnCache.push(direction);
            this._emitProxy(direction);
        }
    },

    /**
     * @param {number} direction
     * @private
     */
    _emitProxy: function(direction) {
        var emit = function() {
            this._emitSnake(direction);
        }.bind(this);
        if (XSS.room && XSS.room.game && XSS.room.game.started) {
            if (this._snakeTurnCache.length <= 1) {
                emit();
            } else {
                setTimeout(emit, this.speed);
            }
        }
    },

    /**
     * @return {number}
     * @private
     */
    _getPrevDirection: function() {
        return (this._snakeTurnCache.length) ?
            this._snakeTurnCache[0] :
            this.direction;
    },

    /**
     * @param {number} direction
     * @param {number} prevDirection
     * @private
     */
    _isTurnAllowed: function(direction, prevDirection) {
        var turns = Math.abs(direction - prevDirection);
        // Disallow 0: no turn, 2: bumping into torso
        return turns === 1 || turns === 3;
    }

});
