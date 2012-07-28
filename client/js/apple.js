/*jshint globalstrict:true*/
/*globals XSS, PixelEntity*/

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
        this.x * 4 + 2, // TODO: make "2" a setting in Game
        this.y * 4 + 2
    );
}

Apple.prototype = {

    addToEntities: function() {
        XSS.ents.apple = this.entity;
    }

};