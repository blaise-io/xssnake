/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS*/
'use strict';

/**
 * @param {number} type
 * @param {number} index
 * @param {Array.<number>} location
 * @constructor
 */
function Spawnable(type, index, location) {
    this.type = type;
    this.x = location[0] * XSS.GAME_TILE + XSS.GAME_LEFT;
    this.y = location[1] * XSS.GAME_TILE + XSS.GAME_TOP;

    this._shapeName = XSS.NS_SPAWN + index;
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
            case XSS.map.SPAWN_APPLE:
                shape = XSS.font.shape(XSS.UC_BULLSEYE, x - 1,  y - 2);
                break;
            case XSS.map.SPAWN_POWERUP:
                shape = XSS.font.shape(XSS.UC_ELECTRIC, x - 1,  y - 1);
                break;
        }

        shape.flash();
        return shape;
    }

};
