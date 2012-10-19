/*jshint globalstrict:true */
/*globals XSS, Shape*/

'use strict';

Shape.prototype._effects = {

    /**
     * @param {number} speed
     * @return {function({number})}
     */
    flash: function(speed) {
        var progress = 0;
        speed = speed || 500;
        return function(delta) {
            progress += delta;
            if (progress > speed) {
                progress -= speed;
                this.enabled(!this.enabled());
            }
        };
    },

    /**
     * @param {number} start
     * @param {number} stop
     * @return {function({number})}
     */
    lifetime: function(start, stop) {
        var progress = 0;
        return function(delta) {
            // Enable/disable shape only once, allows combination
            // with other enabling/disabling effects
            progress += delta;
            if (progress === delta) {
                this.enabled(false);
            }
            if (stop && progress >= stop) {
                this.enabled(false);
                delete this.effects.lifetime;
            } else if (progress >= start) {
                start = stop;
                this.enabled(true);
            }
        };
    },

    /**
     * @param {Object=} options
     * @return {function({number})}
     */
    swipe: function(options) {
        var start, duration, distance,
            clone = this.clone(),
            progress = 0,
            end = -XSS.PIXELS_H;

        options  = options || {};
        start    = options.start ? options.start : 0;
        end      = typeof options.end === 'number' ? options.end : end;
        duration = options.duration || 200;

        return function(delta) {
            progress += delta;
            if (progress < duration) {
                distance = start - ((start - end) * progress / duration);
                distance = Math.round(distance);
                this.pixels(XSS.transform.shift(clone.pixels(), distance, 0));
            } else {
                delete this.effects.swipe;
                if (options.callback) {
                    options.callback();
                }
            }
        };
    }

};