'use strict';

/**
 * Snakes may float away in the wind.
 *
 * @param {Array.<number>=} wind
 * @constructor
 */
xss.LevelWind = function(wind) {
    this.wind = wind || []; // [<x_pixels_p_s, y_pixels_p_s]
    this.progress = [0, 0];
};

xss.LevelWind.prototype = {

    /**
     * @param delta
     * @returns {xss.Shift}
     */
    getShift: function(delta) {
        return [
            this.updateDirection(delta, 0),
            this.updateDirection(delta, 1)
        ];
    },

    /**
     * @param {number} delta
     * @param {number} direction
     * @returns {number}
     */
    updateDirection: function(delta, direction) {
        if (this.wind[direction]) {
            var treshold = 1000 / Math.abs(this.wind[direction]);
            this.progress[direction] += delta;
            if (this.progress[direction] > treshold) {
                this.progress[direction] -= treshold;
                return this.wind[direction] > 0 ? 1 : -1;
            }
        }
        return 0;
    }

};
