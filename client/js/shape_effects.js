'use strict';

/**
 * Extend xss.Shape with client-only effects.
 */
xss.util.extend(xss.Shape.prototype, /** @lends xss.Shape.prototype */ {

    /**
     * @param {number=} on Visible duration
     * @param {number=} off Invisible duration
     * @return {xss.Shape}
     */
    flash: function(on, off) {
        this.effects.flash = this._flashEffect.apply(this, arguments);
        return this;
    },

    /**
     * @param {number} start
     * @param {number} end
     * @return {xss.Shape}
     */
    lifetime: function(start, end) {
        this.effects.lifetime = this._lifetimeEffect.apply(this, arguments);
        return this;
    },

    /**
     * @param {Object=} options
     * @return {xss.Shape}
     */
    animate: function(options) {
        this.effects.animate = this._animateEffect.apply(this, arguments);
        return this;
    },

    /**
     * @param {number} delta
     */
    applyEffects: function(delta) {
        for (var k in this.effects) {
            if (this.effects.hasOwnProperty(k)) {
                this.effects[k].call(this, delta);
            }
        }
    },


    /**
     * @param {number=} on
     * @param {number=} off
     * @return {function({number})}
     * @private
     */
    _flashEffect: function(on, off) {
        var duration = [on || 500, off || 100], progress = 0;
        return function(delta) {
            progress += delta;
            if (progress > duration[+!this.enabled]) {
                progress -= duration[+!this.enabled];
                this.enabled = !this.enabled;
            }
        };
    },

    /**
     * @param {number} start
     * @param {number} end
     * @return {function({number})}
     * @private
     */
    _lifetimeEffect: function(start, end) {
        var key, progress = 0;
        return function(delta) {
            // Enable/disable shape only once, allows combination
            // with other enabling/disabling effects

            // Init
            progress += delta;
            if (progress === delta) {
                this.enabled = false;
            }

            // Start time reached
            if (progress >= start) {
                this.enabled = true;
            }

            // Stop time reached
            if (end && progress >= end) {
                key = xss.util.getKey(xss.shapes, this);
                if (key) {
                    xss.shapes[key] = null;
                }
            }
        };
    },

    /**
     * @param {Object=} options
     * @return {function({number})}
     * @private
     */
    _animateEffect: function(options) {
        var from, to, duration, callback, clone, progress = 0;

        options  = options || {};
        from     = options.from || [0, 0];
        to       = options.to || [0, 0];
        duration = options.duration || 200;
        callback = options.callback || xss.util.dummy;
        clone    = this.clone();

        /** @this {xss.Shape} */
        return function(delta) {
            var x, y;
            progress += delta;
            var progressx = Math.sqrt(progress / duration);
            if (progress < duration) {
                x = from[0] - ((from[0] - to[0]) * progressx);
                x = Math.round(x);
                y = from[1] - ((from[1] - to[1]) * progressx);
                y = Math.round(y);
                this.set(xss.transform.shift(clone.pixels, x, y));
            } else {
                delete this.effects.animate;
                this.set(clone.shift(to[0], to[1]).pixels);
                callback();
            }
        }.bind(this);
    }
});
