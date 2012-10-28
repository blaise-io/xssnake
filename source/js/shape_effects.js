/*jshint globalstrict:true */
/*globals XSS, Shape, Utils*/

'use strict';

Shape.prototype._effects = {

    /**
     * @param {number} speed
     * @return {function({number})}
     */
    flash: function(speed) {
        var progress = 0;
        speed = speed || XSS.FLASH_NORMAL;
        return function(delta) {
            progress += delta;
            if (progress > speed) {
                progress -= speed;
                this.enabled = !this.enabled;
            }
        };
    },

    /**
     * @param {number} start
     * @param {number} stop
     * @param {boolean=} deleteShape
     * @return {function({number})}
     */
    lifetime: function(start, stop, deleteShape) {
        var key, progress = 0;
        return function(delta) {
            // Enable/disable shape only once, allows combination
            // with other enabling/disabling effects

            // Init
            progress += delta;
            if (progress === delta) {
                this.enabled = false;
            }

            // Stop time reached
            if (stop && progress >= stop) {
                if (deleteShape) {
                    key = Utils.getKey(XSS.shapes, this);
                    if (key) { delete XSS.shapes[key]; }
                    key = Utils.getKey(XSS.overlays, this);
                    if (key) { delete XSS.overlays[key]; }
                } else {
                    delete this.effects.lifetime;
                    this.enabled = false;
                }
            }

            // Start time reached
            else if (progress >= start) {
                start = stop;
                this.enabled = true;
            }
        };
    },

    /**
     * @param {Object=} options
     * @return {function({number})}
     */
    swipe: function(options) {
        var start, duration, end, distance, clone, progress = 0;

        options  = options || {};
        start    = typeof options.start === 'number' ? options.start : 0;
        end      = typeof options.end === 'number' ? options.end : -XSS.PIXELS_H;
        duration = options.duration || 200;
        clone    = this.clone();

        return function(delta) {
            progress += delta;
            if (progress < duration) {
                distance = start - ((start - end) * progress / duration);
                distance = Math.round(distance);
                this.pixels = XSS.transform.shift(clone.pixels, distance, 0);
            } else {
                delete this.effects.swipe;
                if (options.callback) {
                    options.callback();
                }
            }
        };
    }

};