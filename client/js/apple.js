/*jshint globalstrict:true*/
/*globals XSS,PixelEntity*/

'use strict';

/**
 * @param {number} x
 * @param {number} y
 * @constructor
 */
function Apple(x, y) {
    this.x = x;
    this.y = y;

    this.px = {
        x: this.x * XSS.GAME_TILE + XSS.GAME_LEFT,
        y: this.y * XSS.GAME_TILE + XSS.GAME_TOP
    };

    this.entity = XSS.drawables.getApple(this.px.x, this.px.y);
    XSS.effects.blink('apple', this.entity, 240);
}

Apple.prototype = {

    showNom: function() {
        var text, entity, random, nom,
            duration = 100,
            x = this.px.x,
            y = this.px.y;

        random = function() {
            var max = 12;
            return -max + Math.floor(Math.random() * max * 2);
        };

        nom = function() {
            text = XSS.font.draw(x - 4 + random(), y + random(), 'nom');
            entity = new PixelEntity(text);
            XSS.effects.decay('nom', entity, duration);
        };

        for (var i = 0; i <= 3; i++) {
            XSS.effects.delay(nom, i * duration);
        }
    },

    eat: function() {
        this.showNom();
        XSS.effects.blinkStop('apple');
    }

};