'use strict';

/**
 * @interface
 * @param {number=} seed
 */
xss.animation.Interface = function(seed) {};
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
