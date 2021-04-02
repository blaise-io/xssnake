/**
 * Extend Shape with client-only effects.
 */
extend(Shape.prototype, /** @lends {Shape.prototype} */ {

    /**
     * @param {number=} width
     * @param {number=} height
     * @return {Shape}
     */
    center(width, height) {
        var x, y, bbox = this.bbox();

        width = width || WIDTH;
        height = height || HEIGHT;

        x = Math.round((width - bbox.width) / 2);
        y = Math.round((height - bbox.height) / 2);

        this.transform.translate = [x - bbox.x0, y - bbox.y0];

        return this;
    },

    setGameTransform() {
        var transform = this.transform, t = GAME_TILE;
        transform.scale = t;
        transform.translate[0] = transform.translate[0] * t + t / GAME_LEFT;
        transform.translate[1] = transform.translate[1] * t + t / GAME_TOP;
    },

    /**
     * @param {number=} on Visible duration
     * @param {number=} off Invisible duration
     * @return {Shape}
     */
    flash(on, off) {
        this.effects.flash = this._flashEffect.apply(this, arguments);
        return this;
    },

    /**
     * @param {number} start
     * @param {number=} end
     * @return {Shape}
     */
    lifetime(start, end) {
        this.effects.lifetime = this._lifetimeEffect.apply(this, arguments);
        return this;
    },

    /**
     * @param {Object=} options
     * @return {Shape}
     */
    animate(options) {
        this.effects.animate = this._animateEffect.apply(this, arguments);
        return this;
    },

    /**
     * @param {number} delta
     */
    applyEffects(delta) {
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
    _flashEffect(on, off) {
        var duration, progress = 0;

        duration = [
            on || FRAME * 24,
            off || FRAME * 6
        ];

        return /** @this Shape */ function(delta) {
            progress += delta;
            if (progress > duration[+!this.enabled]) {
                progress -= duration[+!this.enabled];
                this.enabled = !this.enabled;
            }
        };
    },

    /**
     * @param {number} start
     * @param {number=} end
     * @return {function({number})}
     * @private
     */
    _lifetimeEffect(start, end) {
        var key, progress = 0;

        return /** @this Shape */ function(delta) {
            // Start time reached.
            if (start && progress >= start) {
                start = 0; // Prevent re-setting enabled, conflicts with flash()
                this.enabled = true;
            }

            // Stop time reached.
            if (end && progress >= end) {
                key = getKey(State.shapes, this);
                if (key) {
                    State.shapes[key] = null;
                }
            }

            progress += delta;
        };
    },

    /**
     * @param {Object=} options
     * @return {function({number})}
     * @private
     */
    _animateEffect(options) {
        var from, to, duration, doneCallback, progressCallback, progress = 0;

        options  = options || {};
        from     = options.from || [0, 0];
        to       = options.to || [0, 0];
        duration = typeof options.duration === 'number' ? options.duration : 200;
        doneCallback = options.callback || noop;
        progressCallback = options.progress || noop;

        return function(delta) {
            var x, y, percent;
            progress += delta;
            percent = Math.sqrt(progress / duration);
            if (progress < duration) {
                x = Math.round(from[0] - ((from[0] - to[0]) * percent));
                y = Math.round(from[1] - ((from[1] - to[1]) * percent));
                this.transform.translate = [x, y];
                progressCallback(this, x, y);
            } else {
                this.transform.translate = to;
                delete this.effects.animate;
                doneCallback(this);
            }
        }.bind(this);
    }
});
