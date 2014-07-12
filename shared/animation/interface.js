'use strict';

xss.animation = {};


/**
 * @interface
 */
xss.animation.Interface = function() {};
xss.animation.Interface.prototype = {

    /**
     * Return one or more {xss.PixelCollection}'s.
     * Return null if animation was not updated.
     * @param {number} ms
     * @param {boolean} preGame
     * @return {xss.ShapeCollection}
     */
    update: function(ms, preGame) {
        return new xss.ShapeCollection();
    }

};
