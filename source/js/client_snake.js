/*jshint globalstrict:true, es5:true*/
/*globals XSS, PixelEntity, Snake, Utils*/

'use strict';

/**
 *
 * @param {number} index
 * @param {Array.<number>} location
 * @param {number} direction
 * @param {number} size
 * @param {number} speed
 * @extends {Snake}
 * @constructor
 */
function ClientSnake(index, location, direction, size, speed) {

    Snake.apply(this, arguments);

    this.crashed = false;

    this.elapsed = 0;
    this.entity = new PixelEntity().dynamic(true);

    this._entityName = 'S' + index;
    this._snakeTurnRequests = [];
    this._handleKeysBind = this._handleKeys.bind(this);
}

ClientSnake.prototype = Object.create(Snake.prototype);

ClientSnake.prototype.showName = function() {
    var x, y, entity, entityname;

    x = this.parts[0][0] * 4;
    y = this.parts[0][1] * 4;

    entity = XSS.drawables.textAt(x, y + 1, this.direction, this.name);
    entityname = this._entityName + '_name';

    XSS.ents[entityname] = entity;

    window.setTimeout(function() {
        delete XSS.ents[entityname];
    }.bind(this), 2000);
};

ClientSnake.prototype.addControls = function() {
    XSS.on.keydown(this._handleKeysBind);
};

ClientSnake.prototype.removeControls = function() {
    if (this.local) {
        XSS.off.keydown(this._handleKeysBind);
    }
};

ClientSnake.prototype.addToEntities = function() {
    this.updateEntity();
    XSS.ents[this._entityName] = this.entity;
};

ClientSnake.prototype.updateEntity = function() {
    this.entity.pixels(XSS.effects.zoomGame(this.parts));
};

ClientSnake.prototype.crash = function() {
    this.crashed = true;
    this.removeControls();
};

ClientSnake.prototype.emitState = function(direction) {
    XSS.socket.emit(XSS.events.SERVER_SNAKE_UPDATE, [this.parts, direction]);
};

/**
 * @param {Event} e
 * @private
 */
ClientSnake.prototype._handleKeys = function(e) {
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
};

/** @private */
ClientSnake.prototype.applyCachedDirection = function() {
    if (this._snakeTurnRequests.length) {
        this.direction = this._snakeTurnRequests.shift();
    }
};

/**
 * @return {Array.<number>}
 */
ClientSnake.prototype.getNextPosition = function() {
    var shift, head = this.head();
    this.applyCachedDirection();
    shift = this.directionToShift(this.direction);
    return [head[0] + shift[0], head[1] + shift[1]];
};

/**
 * @param {number} direction
 * @private
 */
ClientSnake.prototype._changeDirection = function(direction) {
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
                window.setTimeout(function() {
                    this.emitState(direction);
                }.bind(this), this.speed - 20);
            }
        }
    }
};

/**
 * @return {number}
 * @private
 */
ClientSnake.prototype._getLastDirection = function() {
    return (this._snakeTurnRequests.length) ?
        this._snakeTurnRequests[0] :
        this.direction;
};

/**
 * @param {number} turns
 * @private
 */
ClientSnake.prototype._isNumTurnAllowed = function(turns) {
    // Disallow 0: no turn, 2: bumping into torso
    return turns === 1 || turns === 3;
};