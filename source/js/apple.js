/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Game, Shape, Util*/
'use strict';

/**
 * @param {number} index
 * @param {number} x
 * @param {number} y
 * @constructor
 */
function Apple(index, x, y) {
    this.x = x * XSS.GAME_TILE + -1 + XSS.GAME_LEFT;
    this.y = y * XSS.GAME_TILE + -2 + XSS.GAME_TOP;

    this._shapeName = 'A' + index;
    XSS.shapes[this._shapeName] = this._getShape();
}

Apple.prototype = {

    destruct: function() {
        XSS.shapes[this._shapeName] = null;
    },

    /**
     * @return {Shape}
     * @private
     */
    _getShape: function() {
        var shape = XSS.font.shape(XSS.UNICODE_BULLSEYE, this.x,  this.y);
        shape.clearPx = true;
        return shape;
    }

};