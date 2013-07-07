/*jshint globalstrict:true, expr:true, sub:true*/
/*globals XSS, CONST*/
'use strict';

/**
 * @param {number} type
 * @param {number} index
 * @param {Array.<number>} location
 * @constructor
 */
function Spawnable(type, index, location) {
    this.type = type;
    this.x = location[0] * CONST.GAME_TILE + CONST.GAME_LEFT;
    this.y = location[1] * CONST.GAME_TILE + CONST.GAME_TOP;

    this._shapeName = CONST.NS_SPAWN + index;
    XSS.shapes[this._shapeName] = this._getShape();
}

Spawnable.prototype = {

    destruct: function() {
        XSS.shapes[this._shapeName] = null;
    },

    /**
     * @return {Shape}
     * @private
     */
    _getShape: function() {
        var shape, x = this.x, y = this.y;

        switch (this.type) {
            case CONST.SPAWN_APPLE:
                shape = XSS.font.shape(CONST.UC_BULLSEYE, x - 1,  y - 2);
                break;
            case CONST.SPAWN_POWERUP:
                shape = XSS.font.shape(CONST.UC_ELECTRIC, x - 1,  y - 1);
                break;
        }

        shape.flash();
        return shape;
    }

};
