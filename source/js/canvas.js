/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, BoundingBox*/
'use strict';

/**
 * Canvas drawing
 * @constructor
 */
function Canvas() {
    this.canvas = this._setupCanvas();
    this.ctx = this.canvas.getContext('2d');

    this._setCanvasDimensions();

    if (!window.requestAnimationFrame) {
        this._vendorRequestAnimationFrame();
    }

    this._positionCanvas();
    this._addEventListeners();

    this._lastPaint = new Date() - 20;
    this._frameBound = this._frame.bind(this);
    this._frameBound();
}

Canvas.prototype = {

    /**
     * @param {number} delta
     */
    paint: function(delta) {
        // Abuse this loop to trigger game tick
        XSS.pubsub.publish(XSS.GAME_TICK, delta);

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Paint all layers
        this._paint(delta, XSS.shapes, XSS.overlays);
    },

    /**
     * @param {number} delta
     * @param {...} varArgs
     * @private
     */
    _paint: function(delta, varArgs) {
        for (var i = 1, m = arguments.length; i < m; i++) {
            var arg = arguments[i];
            for (var k in arg) {
                if (arg.hasOwnProperty(k)) {
                    this._paintShapeDispatch(k, arg[k], delta);
                }
            }
        }
    },

    /** @private */
    _frame: function() {
        var now, delta;

        // Make appointment for next paint. Quit on error.
        if (!XSS.error) {
            window.requestAnimationFrame(this._frameBound, this.canvas);
        }

        // Time since last paint
        now = +new Date();
        delta = now - this._lastPaint;
        this._lastPaint = now;

        // Show FPS in title bar
        // var fps = Math.round(1000 / delta);
        // document.title = 'XXSNAKE ' + fps;

        // Do not paint when requestAnimationFrame is
        // catching up or heavily delayed.
        if (delta >= 7 && delta <= 250) {
            this.paint(delta);
        }
    },

    /**
     * @param {Object} context
     * @param {Shape} shape
     * @param {BoundingBox} bbox
     * @private
     */
    _paintShape: function(context, shape, bbox) {
        var pixels = shape.pixels;

        // Dip paint brush
        context.fillStyle = 'rgb(0,0,0)';

        for (var i = 0, m = pixels.length; i < m; i++) {
            context.fillRect(
                pixels[i][0] * this.tileSize - bbox.x1,
                pixels[i][1] * this.tileSize - bbox.y1,
                this.pixelSize,
                this.pixelSize
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
        var cache, bbox;

        // Apply effects
        for (var k in shape.effects) {
            if (shape.effects.hasOwnProperty(k)) {
                shape.effects[k].call(shape, delta);
            }
        }

        // Draw on canvas
        if (true === shape.enabled) {

            // Clear surface below shape
            if (shape.clip) {
                bbox = shape.bbox();
                this.ctx.clearRect(bbox.x1, bbox.y1, bbox.width, bbox.height);
            }

            if (shape.dynamic) {
                // Paint shape without caching
                this._paintShape(this.ctx, shape, new BoundingBox());
            } else {
                // Create cache and paint
                cache = shape.cache;
                if (!cache) {
                    shape.cache = cache = this._cacheShapePaint(shape);
                }
                this.ctx.drawImage(cache.canvas, cache.bbox.x1, cache.bbox.y1);
            }
        }
    },

    /**
     * @param {Shape} shape
     * @return {ShapeCache}
     * @private
     */
    _cacheShapePaint: function(shape) {
        var bbox, canvas;

        bbox = this._getBBoxRealPixels(shape);

        canvas = document.createElement('canvas');
        canvas.width  = bbox.width;
        canvas.height = bbox.height;

        this._paintShape(canvas.getContext('2d'), shape, bbox);

        return {
            canvas: canvas,
            bbox  : bbox
        };
    },

    /**
     * @return {number}
     * @private
     */
    _getTileSize: function() {
        return Math.floor(Math.min(
            window.innerWidth / XSS.PIXELS_H,
            window.innerHeight / XSS.PIXELS_V
        )) || 1;
    },

    /** @private */
    _vendorRequestAnimationFrame: function() {
        window['requestAnimationFrame'] =
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    },

    /** @private */
    _addEventListeners: function() {
        window.onresize = this._positionCanvas.bind(this);
    },

    _clearShapeCache: function() {
        var objs = [XSS.shapes, XSS.overlays];
        for (var i = 0, m = objs.length; i < m; i++) {
            var arg = objs[i];
            for (var k in arg) {
                if (arg.hasOwnProperty(k)) {
                    arg[k].uncache();
                }
            }
        }
    },

    /** @private */
    _setCanvasDimensions: function() {
        this.tileSize = this._getTileSize();

        // Attempt to make fat pixels pleasing at all sizes
        if (this.tileSize >= 4) {
            this.pixelSize = this.tileSize-1;
        } else if (this.tileSize >= 3) {
            this.pixelSize = this.tileSize * 0.8;
        } else {
            this.pixelSize = this.tileSize;
        }

        this.canvasWidth = this.tileSize * XSS.PIXELS_H;
        this.canvasHeight = this.tileSize * XSS.PIXELS_V;
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        this._setbackgroundPattern();
    },

    /** @private */
    _positionCanvas: function() {
        var windowCenter, windowMiddle, left, top, style;

        this._setCanvasDimensions();
        this._clearShapeCache();

        windowCenter = window.innerWidth / 2;
        windowMiddle = window.innerHeight / 2;

        left = this._snapToFatPixels(windowCenter - (this.canvasWidth / 2));
        top = this._snapToFatPixels(windowMiddle - (this.canvasHeight / 2));

        style = this.canvas.style;
        style.position = 'absolute';
        style.left = Math.max(0, left) + 'px';
        style.top = Math.max(0, top) + 'px';
    },

    /** @private */
    _setbackgroundPattern: function() {
        var canvas, context, pixelSize, rectSize;

        pixelSize = Math.max(this.tileSize, 2);
        rectSize = pixelSize - 1;

        canvas = document.createElement('canvas');
        canvas.width  = pixelSize;
        canvas.height = pixelSize;

        context = canvas.getContext('2d');
        context.fillStyle = 'rgba(0,0,0,.1)';
        context.fillRect(0, 0, rectSize, rectSize);

        XSS.doc.style.background = 'url(' + canvas.toDataURL('image/png') + ')';
    },

    /**
     * @return {Element}
     * @private
     */
    _setupCanvas: function() {
        var canvas = document.createElement('canvas');
        XSS.doc.appendChild(canvas);
        return canvas;
    },

    /**
     * @param {Shape} shape
     * @return {BoundingBox}
     * @private
     */
    _getBBoxRealPixels: function(shape) {
        var bbox = shape.bbox();
        for (var k in bbox) {
            if (bbox.hasOwnProperty(k)) {
                bbox[k] *= this.tileSize;
            }
        }
        return bbox;
    },

    /**
     * @param {number} num
     * @return {number}
     * @private
     */
    _snapToFatPixels: function(num) {
        return Math.floor(num / this.tileSize) * this.tileSize;
    }

};