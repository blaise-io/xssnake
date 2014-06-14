'use strict';

/**
 * @param {number} index
 * @param {boolean} local
 * @param {string} name
 * @param {Array.<number>} location
 * @param {number} direction
 * @extends {xss.Snake}
 * @constructor
 */
xss.ClientSnake = function(index, local, name, location, direction) {
    xss.Snake.call(this, location, direction, xss.SNAKE_SIZE, xss.SNAKE_SPEED);

    this.index   = index;
    this.local   = local;
    this.name    = name;
    this.elapsed = 0;
    this.limbo   = false;

    /**
     * @type {Array}
     * @private
     */
    this._snakeTurnCache = [];

    /** @type {Object.<string,string>} */
    this.shapeKeys = {
        snake    : xss.NS_SNAKE + index,
        name     : xss.NS_SNAKE + 'TAG' + index,
        direction: xss.NS_SNAKE + 'DIR' + index
    };

    this.updateShape();
};

/** @lends {xss.ClientSnake.prototype} */
xss.util.extend(xss.ClientSnake.prototype, xss.Snake.prototype);
xss.util.extend(xss.ClientSnake.prototype, /** @lends xss.ClientSnake.prototype */ {

    destruct: function() {
        this.crash();
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
        var x, y, shape;

        x = this.parts[0][0] * 4;
        y = this.parts[0][1] * 4;

        switch (this.direction) {
            case 0: y +=  4; x -=  4; break;
            case 1: y -=  4; x +=  4; break;
            case 2: y +=  4; x += 10; break;
            case 3: y += 10; x +=  4; break;
        }

        shape = xss.shapegen.tooltip(this.name, x, y, this.direction);
        xss.shapes[this.shapeKeys.name] = shape;
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
            return xss.util.randomRange(-12, 12);
        };

        for (var i = 0; i <= duration * amount; i += duration) {
            var shape, name, h = this.head();
            shape = xss.font.shape(label, h[0] * 4 + rand(), h[1] * 4 + rand());
            name = xss.NS_SNAKE + xss.util.randomStr();
            xss.shapes[name] = shape.lifetime(i, duration + i);
        }
    },

    showDirection: function() {
        var shift, head, shape;
        shift = xss.GAME_SHIFT_MAP[this.direction];
        head = this.head();

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
        if (this.local) {
            xss.event.on(
                xss.EVENT_KEYDOWN,
                xss.NS_SNAKE,
                this._handleKeys.bind(this)
            );
        }
    },

    removeControls: function() {
        if (this.local) {
            xss.event.off(xss.EVENT_KEYDOWN, xss.NS_SNAKE);
        }
    },

    updateShape: function() {
        var shape = new xss.Shape();
        shape.pixels.addPairs(this.parts);
        shape.setGameTransform();
        xss.shapes[this.shapeKeys.snake] = shape;
    },

    crash: function() {
        this.crashed = true;
        this.removeControls();
        this.updateShape();
        this.explodeParticles();
    },

    explodeParticles: function() {
        var x, y, head = this.head();
        x = head[0] * xss.GAME_TILE + xss.GAME_LEFT;
        y = head[1] * xss.GAME_TILE + xss.GAME_TOP;
        if (!this._exploded) {
            this._exploded = true;
            xss.shapegen.explosion(
                x + xss.util.randomRange(0,3),
                y + xss.util.randomRange(0,3),
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
        sync = Math.round(xss.NETCODE_SYNC_MS / this.speed);
        data = [this.parts.slice(-sync), direction];
        xss.socket.emit(xss.EVENT_SNAKE_UPDATE, data);
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
        shift = xss.GAME_SHIFT_MAP[this.direction];
        return [head[0] + shift[0], head[1] + shift[1]];
    },

    /**
     * @param {Event} ev
     * @private
     */
    _handleKeys: function(ev) {
        if (xss.keysBlocked) {
            return;
        }
        this._changeDirection(xss.KEY_TO_DIRECTION[ev.keyCode]);
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
        if (xss.room && xss.room.game && xss.room.game.model.started) {
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
