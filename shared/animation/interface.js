'use strict';

xss.animation = {};


/**
 * @interface
 */
xss.animation.Interface = function() {};
xss.animation.Interface.prototype = {
    /**
     * For deterministic randomness.
     * @type {number}
     */
    seed: 0,

    /**
     * Return one or more ShapePixel objects.
     * Return null if animation was not updated.
     * @param {number} ms
     * @param {boolean} preGame
     * @return {Array.<xss.ShapePixels>}
     */
    update: function(ms, preGame) { return []; }
};
