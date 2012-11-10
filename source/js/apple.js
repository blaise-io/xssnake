/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Shape, Utils*/
'use strict';

/**
 * @param {number} index
 * @param {number} x
 * @param {number} y
 * @constructor
 */
function Apple(index, x, y) {
    var shape;

    this.ns = 'A' + index;
    this.x = x;
    this.y = y;

    this.px = {
        x: this.x * XSS.GAME_TILE + -1 + XSS.GAME_LEFT,
        y: this.y * XSS.GAME_TILE + -2 + XSS.GAME_TOP
    };

    shape = new Shape();
    shape.str(XSS.PIXELS.APPLE).flash();
    shape.shift(this.px.x, this.px.y);

    XSS.shapes[this.ns] = shape;
}

Apple.prototype = {

    destruct: function() {
        delete XSS.shapes[this.ns];
    },

    eat: function() {
        this._showNomNomNom();
        this.destruct();
    },

    _showNomNomNom: function() {
        var random, x, y;

        x = this.px.x;
        y = this.px.y;

        random = function() {
            return Utils.randomBetween(-12, 12);
        };

        for (var i = 0; i <= 300; i += 100) {
            var shape = XSS.font.shape(x + random(), y + random(), 'nom');
            XSS.shapes['nom' + i] = shape.lifetime(i, 100 + i, true);
        }
    }

};