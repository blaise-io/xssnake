/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Shape, Util*/
'use strict';

/**
 * @param {number} index
 * @param {number} x
 * @param {number} y
 * @constructor
 */
function Apple(index, x, y) {
    this.px = {
        x: x * XSS.GAME_TILE + -1 + XSS.GAME_LEFT,
        y: y * XSS.GAME_TILE + -2 + XSS.GAME_TOP
    };

    this._shapeName = 'A' + index;
    XSS.shapes[this._shapeName] = this._getShape();
}

Apple.prototype = {

    destruct: function() {
        delete XSS.shapes[this._shapeName];
    },

    eat: function() {
        this._showNomNomNom();
        this.destruct();
    },

    /**
     * @return {Shape}
     * @private
     */
    _getShape: function() {
        return XSS.font.shape(XSS.UNICODE_BULLSEYE, this.px.x,  this.px.y);
    },

    _showNomNomNom: function() {
        var random, x, y;

        x = this.px.x;
        y = this.px.y;

        random = function() {
            return Util.randomBetween(-12, 12);
        };

        for (var i = 0; i <= 300; i += 100) {
            var shape = XSS.font.shape('nom', x + random(), y + random());
            XSS.shapes['nom' + i] = shape.lifetime(i, 100 + i, true);
        }
    }

};