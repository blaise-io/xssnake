/*jshint globalstrict:true*/
/*globals XSS,PixelEntity,Game*/

'use strict';

/**
 * @param {number} x
 * @param {number} y
 * @constructor
 */
function Apple(x, y) {
    this.x = x;
    this.y = y;

    this.entity = XSS.drawables.getApple(
        this.x * XSS.GAME_TILE + XSS.GAME_LEFT,
        this.y * XSS.GAME_TILE + XSS.GAME_TOP
    );
}

Apple.prototype = {

    addToEntities: function() {
        XSS.ents.apple = this.entity;
    }

};