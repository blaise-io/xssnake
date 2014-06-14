'use strict';

/**
 * @param {number} type
 * @param {number} index
 * @param {xss.Coordinate} location
 * @constructor
 */
xss.Spawnable = function(type, index, location) {
    this.type = type;
    this.x = location[0] * xss.GAME_TILE + xss.GAME_LEFT;
    this.y = location[1] * xss.GAME_TILE + xss.GAME_TOP;

    this._shapeName = xss.NS_SPAWN + index;
    xss.shapes[this._shapeName] = this._getShape();
};

xss.Spawnable.prototype = {

    destruct: function() {
        xss.shapes[this._shapeName] = null;
    },

    /**
     * @return {xss.Shape}
     * @private
     */
    _getShape: function() {
        var shape, x = this.x, y = this.y;

        switch (this.type) {
            case xss.SPAWN_APPLE:
                shape = xss.font.shape(xss.UC_BULLSEYE, x - 1,  y - 2);
                break;
            case xss.SPAWN_POWERUP:
                shape = xss.font.shape(xss.UC_ELECTRIC, x - 1,  y - 1);
                break;
        }

        shape.flash();
        return shape;
    }

};
