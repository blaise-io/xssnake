'use strict';

/**
 * @param {number} type
 * @param {number} index
 * @param {xss.Coordinate} location
 * @constructor
 */
xss.game.Spawnable = function(type, index, location) {
    this.type = type;
    this.x = xss.util.translateGameX(location[0]);
    this.y = xss.util.translateGameY(location[1]);

    this._shapeName = xss.NS_SPAWN + index;
    xss.shapes[this._shapeName] = this._getShape();
};

xss.game.Spawnable.prototype = {

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
                shape = xss.font.shape(xss.UC_APPLE, x - 1,  y - 2);
                break;
            case xss.SPAWN_POWERUP:
                shape = xss.font.shape(xss.UC_ELECTRIC, x - 1,  y - 1);
                break;
        }

        shape.flash();
        return shape;
    }

};
