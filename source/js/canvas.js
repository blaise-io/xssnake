/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, BoundingBox, ShapePixels*/
'use strict';

/**
 * Canvas drawing
 * @constructor
 */
function Canvas() {
    var theme = XSS.util.storage(XSS.STORAGE_THEME);

    this.canvas = this._setupCanvas();
    this.ctx = this.canvas.getContext('2d');

    this.setTheme(XSS.themes[theme] || XSS.themes[0]);

    if (!window.requestAnimationFrame) {
        this._useVendorRequestAnimationFrame();
    }

    this._positionCanvas();
    this._bindEvents();

    this.focus = true;
    this._prevFrame = new Date();
    this._frameBound = this._frame.bind(this);

    window.requestAnimationFrame(this._frameBound, this.canvas);
}

/**
 * Level of ghosting. 0 = no ghosting, 1 = permanent on
 * @const
 * @type {number}
 */
Canvas.GHOSTING = 0.6;

Canvas.prototype = {

    /**
     * @param {Object} theme
     */
    setTheme: function(theme) {
        this.theme = theme;
        this._clearShapeCache();
        this._setCanvasDimensions();
        this._setPatterns();
    },

    /**
     * @param {number} delta
     */
    paint: function(delta) {
        // Abuse this loop to trigger game tick
        XSS.pubsub.publish(XSS.PUB_GAME_TICK, delta, this.focus);

        // Clear canvas
        this.ctx.save();
        this.ctx.fillStyle = this.tileOff;
        this.ctx.globalAlpha = 1 - Canvas.GHOSTING;
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.ctx.restore();

        // Paint all layers
        this._paint(delta, XSS.shapes);
    },

    /**
     * Remove all nulled shapes. We don't delete shapes immediately
     * because this triggers a slow garbage collection during gameplay,
     * which may affect fps negatively.
     */
    garbageCollect: function() {
        var shapes = XSS.shapes;
        for (var k in shapes) {
            if (shapes.hasOwnProperty(k) && null === shapes[k]) {
                delete shapes[k];
            }
        }
    },

    /**
     * @param {number} delta
     * @param {*} shapes
     * @private
     */
    _paint: function(delta, shapes) {
        var k, overlays = {};
        for (k in shapes) {
            if (shapes.hasOwnProperty(k) && null !== shapes[k]) {
                if (shapes[k].clearBBox) {
                    overlays[k] = shapes[k];
                } else {
                    this._paintShape(k, shapes[k], delta);
                }
            }
        }

        // Overlays are painted at a later time
        for (k in overlays) {
            if (overlays.hasOwnProperty(k)) {
                this._paintShape(k, overlays[k], delta);
            }
        }
    },

    /** @private */
    _frame: function(now) {
        var delta;

        // Make appointment for next paint. Quit on error.
        if (!XSS.error) {
            window.requestAnimationFrame(this._frameBound, this.canvas);
        }

        // Time since last paint
        delta = now - this._prevFrame;
        this._prevFrame = now;

        // Show FPS in title bar
        // var fps = Math.round(1000 / delta);
        // document.title = 'XXSNAKE ' + fps;

        this.paint(delta);
    },

    /**
     * @param {Object} context
     * @param {number} x
     * @param {number} y
     * @param {number} offsetX
     * @param {number} offsetY
     * @suppress {checkTypes}
     * @private
     */
    _paintPixel: function(context, x, y, offsetX, offsetY) {
        var tileSize = this.tileSize;
        offsetX = x * tileSize - offsetX;
        offsetY = y * tileSize - offsetY;
        context.fillRect(offsetX, offsetY, tileSize, tileSize);
    },

    /**
     * @param {string} name
     * @param {Shape} shape
     * @param {number} delta
     * @private
     */
    _paintShape: function(name, shape, delta) {
        var bbox, cache, ctx = this.ctx;

        // Apply effects if FPS is in a normal range. If window is out
        // of focus, we don't want animations. Also we do not want anims
        // if a browser is "catching up" frames after being focused after
        // a blur, where it tries to make up for slow frames.
        if (delta > XSS.MIN_FRAME_DELTA && delta < XSS.MAX_FRAME_DELTA) {
            shape.applyEffects(delta);
        }

        // Draw on canvas if shape is enabled and visible
        if (false === shape.enabled) {
            return;
        }

        // Clear surface below shape
        if (shape.clearBBox) {
            bbox = this._getCanvasBBox(shape);
            ctx.fillStyle = this.tileOff;
            ctx.fillRect(bbox.x1, bbox.y1, bbox.width, bbox.height);
        }

        // Create cache and paint
        cache = shape.cache || (shape.cache = this._getPaintedShape(shape));
        ctx.drawImage(cache.canvas, cache.bbox.x1, cache.bbox.y1);
    },

    /**
     * @param {Object} context
     * @param {Shape} shape
     * @param {BoundingBox} bbox
     */
    _paintShapeNoCache: function(context, shape, bbox) {
        context.fillStyle = this.tileOn;
        shape.pixels.each(function(x, y) {
            this._paintPixel(context, x, y, bbox.x1, bbox.y1);
        }.bind(this));
    },

    /**
     * @param {Shape} shape
     * @return {XSS.ShapeCache}
     * @private
     */
    _getPaintedShape: function(shape) {
        var bbox, canvas;

        bbox = this._getCanvasBBox(shape, true);

        canvas = document.createElement('canvas');
        canvas.width  = bbox.width + this.tileSize;
        canvas.height = bbox.height + this.tileSize;

        this._paintShapeNoCache(canvas.getContext('2d'), shape, bbox);

        return {canvas: canvas, bbox: bbox};
    },

    /**
     * @return {number}
     * @private
     */
    _getTileSize: function() {
        return Math.floor(Math.min(
            window.innerWidth / XSS.WIDTH,
            window.innerHeight / XSS.HEIGHT
        )) || 1;
    },

    /** @private */
    _useVendorRequestAnimationFrame: function() {
        window['requestAnimationFrame'] =
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback) {
                setTimeout(callback, 1000 / 60);
            };
    },

    /** @private */
    _bindEvents: function() {
        window.onresize = this._positionCanvas.bind(this);
        window.onfocus  = this._handleFocusChange.bind(this);
        window.onblur   = this._handleFocusChange.bind(this);
        window.onclick  = this._promoteKeyboard.bind(this);
    },

    /**
     * @param {Event} ev
     * @private
     */
    _handleFocusChange: function(ev) {
        this.focus = (ev.type !== 'blur');
        XSS.pubsub.publish(XSS.PUB_FOCUS_CHANGE, this.focus);
    },

    /**
     * @param {Event} ev
     * @private
     */
    _promoteKeyboard: function(ev) {
        if (Number(ev.which) !== 1) { // Only LMB
            return;
        }
        XSS.util.instruct(
            'No mousing please',
            4000
        );
    },

    /**
     * @private
     */
    _clearShapeCache: function() {
        var shapes = XSS.shapes;
        for (var k in shapes) {
            if (shapes.hasOwnProperty(k) && null !== shapes[k]) {
                shapes[k].uncache();
            }
        }
    },

    /** @private */
    _setCanvasDimensions: function() {
        this.tileSize = this._getTileSize();

        // Attempt to make fat pixels pleasing at all sizes
        if (this.tileSize >= 4) {
            this.pixelSize = this.tileSize - 1;
        } else if (this.tileSize === 1) {
            this.pixelSize = 1;
        } else {
            this.pixelSize = this.tileSize - 0.6;
        }

        this.canvasWidth = this.tileSize * XSS.WIDTH;
        this.canvasHeight = this.tileSize * XSS.HEIGHT;
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
    },

    /**
     * @param {Event=} e
     * @private
     */
    _positionCanvas: function(e) {
        var windowCenter, windowMiddle, left, top, style;

        if (e) {
            this._clearShapeCache();
            this._setCanvasDimensions();
            this._setPatterns();
        }

        windowCenter = window.innerWidth / 2;
        windowMiddle = window.innerHeight / 2;

        left = this._snapCanvasToTiles(windowCenter - (this.canvasWidth / 2));
        top = this._snapCanvasToTiles(windowMiddle - (this.canvasHeight / 2));

        style = this.canvas.style;
        style.position = 'absolute';
        style.left = Math.max(0, left) + 'px';
        style.top = Math.max(0, top) + 'px';
    },

    /** @private */
    _setPatterns: function() {
        var canvas, getTile, backgroundImage;

        canvas = document.createElement('canvas');
        canvas.setAttribute('width', this.tileSize);
        canvas.setAttribute('height', this.tileSize);

        getTile = function(color) {
            var context = canvas.getContext('2d');
            context.fillStyle = this.theme.bg;
            context.fillRect(0, 0, this.tileSize, this.tileSize);
            context.fillStyle = color;
            context.fillRect(0, 0, this.pixelSize, this.pixelSize);
            return this.ctx.createPattern(canvas, 'repeat');
        }.bind(this);

        this.tileOn = getTile(this.theme.on);
        this.tileOff = getTile(this.theme.off);

        backgroundImage = ' url(' + canvas.toDataURL('image/png') + ')';
        XSS.doc.style.background = this.theme.bg + backgroundImage;
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
     * @param {boolean=} ignoreExpand
     * @return {BoundingBox}
     * @private
     */
    _getCanvasBBox: function(shape, ignoreExpand) {
        var bbox = (ignoreExpand) ? shape.pixels.bbox() : shape.bbox();
        bbox = XSS.util.extend({}, bbox);

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
    _snapCanvasToTiles: function(num) {
        return Math.floor(num / this.tileSize) * this.tileSize;
    }

};