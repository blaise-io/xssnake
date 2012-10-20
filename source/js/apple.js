/*jshint globalstrict:true*/
/*globals XSS,Shape*/

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
    shape.str(XSS.PIXELS.APPLE).flash(240);
    shape.shift(this.px.x, this.px.y);

    XSS.shapes[this.ns] = shape;
}

Apple.prototype = {

    destruct: function() {
        XSS.shapes[this.ns] = null;
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
            var max = 12;
            return -max + Math.floor(Math.random() * max * 2);
        };

        for (var i = 0; i <= 3; i++) {
            var shape;

            shape = XSS.font.shape(x + random(), y + random(), 'nom');
            shape.lifetime(i * 100, 100 + i * 100);

            XSS.shapes['nom' + i] = shape;
        }
    }

};