'use strict';

/**
 * Snakes may float away in the wind.
 *
 * @param {Array.<number>} strengths
 * @constructor
 */
xss.Wind = function(strengths) {
    this.strengths = strengths; // [<x_pixels_p_s, y_pixels_p_s]
    this.progress = [0, 0];
};

xss.Wind.prototype = {

    update: function(delta) {
        return [
            this.updateDirection(delta, 0),
            this.updateDirection(delta, 1)
        ];
    },

    updateDirection: function(delta, direction) {
        if (this.strengths[direction]) {
            var treshold = 1000 / Math.abs(this.strengths[direction]);
            this.progress[direction] += delta;
            if (this.progress[direction] > treshold) {
                this.progress[direction] -= treshold;
                return this.strengths[direction] > 0 ? 1 : -1;
            }
        }
        return 0;
    }

};
