/*jshint globalstrict:true, sub:true*/
/*globals XSS, Shape, Utils*/

'use strict';

/**
 * Canvas drawing
 * @constructor
 */
function Canvas() {
    this.canvas = this._setupCanvas();
    this.ctx = this.canvas.getContext('2d');

    this._setRequestAnimationFrame();
    this._positionCanvas();
    this._addEventListeners();
    this._paint();
}

Canvas.prototype = {

    /** @private */
    _setRequestAnimationFrame: function() {
        window['requestAnimationFrame'] = (function() {
            return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function(callback) {
                    window.setTimeout(callback, 1000 / 60);
                };
        })();
    },

    /** @private */
    _addEventListeners: function() {
        window.onresize = this._positionCanvas.bind(this);
    },

    /** @private */
    _positionCanvas: function() {
        var windowCenter, windowMiddle, left, top, style;

        windowCenter = window.innerWidth / 2;
        windowMiddle = window.innerHeight / 2;

        left = this._snapToFatPixels(windowCenter - (XSS.CANVAS_WIDTH / 2));
        top = this._snapToFatPixels(windowMiddle - (XSS.CANVAS_HEIGHT / 2));

        style = this.canvas.style;
        style.position = 'absolute';
        style.left = Math.max(0, left) + 'px';
        style.top = Math.max(0, top) + 'px';
    },

    /**
     * @return {Element}
     * @private
     */
    _setupCanvas: function() {
        var canvas = document.createElement('canvas');
        canvas.setAttribute('width', XSS.CANVAS_WIDTH);
        canvas.setAttribute('height', XSS.CANVAS_HEIGHT);
        XSS.doc.appendChild(canvas);
        return canvas;
    },

    /**
     * @param {Shape} shape
     * @return {Object}
     * @private
     */
    _getBBoxRealPixels: function(shape) {
        var bbox = shape.bbox();
        for (var k in bbox) {
            if (bbox.hasOwnProperty(k)) {
                bbox[k] *= XSS.PIXEL_SIZE;
            }
        }
        return bbox;
    },

    /**
     * @param {number} number
     * @return {number}
     * @private
     */
    _snapToFatPixels: function(number) {
        return Math.round(number / XSS.PIXEL_SIZE) * XSS.PIXEL_SIZE;
    },

    /**
     * @param {Shape} shape
     * @return {Object}
     * @private
     */
    _cacheShapePaint: function(shape) {
        var bbox, canvas;

        bbox = this._getBBoxRealPixels(shape);

        canvas = document.createElement('canvas');
        canvas.setAttribute('width', bbox.width);
        canvas.setAttribute('height', bbox.height);

        this._paintShape(canvas.getContext('2d'), shape, bbox);

        return {
            canvas: canvas,
            bbox  : bbox
        };
    },

    /**
     * @param {Object} context
     * @param {Shape} shape
     * @param {Object} offset
     * @private
     */
    _paintShape: function(context, shape, offset) {
        var pixels = shape.pixels();

        offset.x = offset.x || 0;
        offset.y = offset.y || 0;

        // Dip paint brush
        context.fillStyle = 'rgb(0,0,0)';

        for (var i = 0, m = pixels.length; i < m; ++i) {
            context.fillRect(
                pixels[i][0] * XSS.PIXEL_SIZE - offset.x,
                pixels[i][1] * XSS.PIXEL_SIZE - offset.y,
                XSS.PIXEL_SIZE - 1,
                XSS.PIXEL_SIZE - 1
            );
        }
    },

    /**
     * @param {string} name
     * @param {Shape} shape
     * @param {number} delta
     * @private
     */
    _paintShapeDispatch: function(name, shape, delta) {
        var cache;

        if (false === shape instanceof Shape) {
            throw new Error(name);
        }

        for (var k in shape.effects) {
            if (shape.effects.hasOwnProperty(k)) {
                shape.effects[k].call(shape, delta);
            }
        }

        if (true === shape.enabled()) {
            if (shape.dynamic()) {
                this._paintShape(this.ctx, shape, {});
            } else {
                cache = shape.cache();
                if (!cache) {
                    cache = this._cacheShapePaint(shape);
                    shape.cache(cache);
                }
                this.ctx.drawImage(cache.canvas, cache.bbox.x, cache.bbox.y);
            }
        }
    },

    /** @private */
    _paint: function() {
        var now, delta, fps;

        // Time since last paint
        now = +new Date();
        delta = now - this.time;
        this.time = now;

        // Show FPS in title bar
        fps = Math.round(1000 / delta);
        document.title = 'XXSNAKE ' + fps;

        // Abuse this loop to trigger the game tick
        XSS.pubsub.publish(XSS.GAME_TICK, delta);

        if (!XSS.error) {
            // Make appointment for next paint
            window.requestAnimationFrame(this._paint.bind(this), this.canvas);
        }

        // Handle requestAnimationFrame's variable frame rate when
        // focussing and blurring windows. Don't do this for game tick.
        if (delta <= 10 || delta >= 200) {
            delta = 0;
        }

        this.ctx.clearRect(0, 0, XSS.CANVAS_WIDTH, XSS.CANVAS_HEIGHT);

        for (var k in XSS.shapes) {
            if (XSS.shapes.hasOwnProperty(k)) {
                this._paintShapeDispatch(k, XSS.shapes[k], delta);
            }
        }
    }

};