/*jshint globalstrict:true*/
/*globals XSS,PixelEntity*/

'use strict';

/**
 * @param {number} index
 * @param {number} x
 * @param {number} y
 * @constructor
 */
function Apple(index, x, y) {
    this.ns = 'A' + index;
    this.x = x;
    this.y = y;

    this.px = {
        x: this.x * XSS.GAME_TILE + XSS.GAME_LEFT,
        y: this.y * XSS.GAME_TILE + XSS.GAME_TOP
    };

    XSS.ents[this.ns] = XSS.drawables.apple(this.px.x, this.px.y);
    XSS.ents[this.ns].flash(240);
}

Apple.prototype = {

    destruct: function() {
        XSS.ents[this.ns] = null;
        delete XSS.ents[this.ns];
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
            var text, entity;

            text = XSS.font.draw(x + random(), y + random(), 'nom');
            entity = new PixelEntity(text);
            entity.lifetime(i * 100, 100 + i * 100);

            XSS.ents['nom' + i] = entity;
        }
    }

};