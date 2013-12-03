'use strict';

xss.animation = {};


/**
 * @interface
 * @todo: Move to separate file
 */
xss.animation.Interface = function() {};
xss.animation.Interface.prototype = {
    /**
     * For deterministic randomness.
     * @type string
     */
    seed: '',

    /**
     * Return one or more ShapePixel objects.
     * Return null if animation was not updated.
     * @param ms
     * @return {Array.<xss.ShapePixels>}
     */
    update: function(ms) {}
};
