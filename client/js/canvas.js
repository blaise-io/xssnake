'use strict';

/**
 * Canvas drawing
 * @constructor
 */
xss.Canvas = function() {
    var color = xss.util.storage(xss.STORAGE_COLOR);

    this.fps = [];
    this.canvas = this._setupCanvas();
    this.context = this.canvas.getContext('2d');
    this.tile = new xss.CanvasTile(xss.COLOR[color] || xss.COLOR[0]);

    this._setCanvasDimensions();
    this._positionCanvas();
    this._bindEvents();

    if (!window.requestAnimationFrame) {
        this._setRequestAnimationFrame();
    }

    this.focus = true;
    this._prevFrame = new Date();
    this._frameBound = this._frame.bind(this);

    window.requestAnimationFrame(this._frameBound, this.canvas);
};

xss.Canvas.prototype = {

    /**
     * @param {Object} color
     */
    setColor: function(color) {
        this.tile.setColor(color);
        this._flushShapeCache();
    },

    /**
     * @param {number} delta
     */
    paint: function(delta) {
        // Abuse this loop to trigger game tick
        xss.event.trigger(xss.PUB_GAME_TICK, delta, this.focus);

        // Clear canvas
        this._clear();

        // Paint all layers
        this._paintShapes(delta);
    },

    /**
     * Remove all nulled shapes. We don't delete shapes immediately
     * because this triggers a slow garbage collection during gameplay,
     * which may affect framerate negatively.
     */
    garbageCollect: function() {
        var shapes = xss.shapes;
        for (var k in shapes) {
            if (shapes.hasOwnProperty(k) && null === shapes[k]) {
                delete shapes[k];
            }
        }
    },

    _flushShapeCache: function() {
        var shapes = xss.shapes;
        for (var k in shapes) {
            if (shapes.hasOwnProperty(k) && null !== shapes[k]) {
                shapes[k].uncache();
            }
        }
    },

    _clear: function() {
        this.context.save();
        this.context.fillStyle = this.tile.off;
        this.context.globalAlpha = 1 - this.tile.color.ghosting;
        this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.context.restore();
    },

    /**
     * @param {number} delta
     * @private
     */
    _paintShapes: function(delta) {
        var overlays = [], shapeKeys = Object.keys(xss.shapes);

        // Avoid looping over an uncached keyval object.
        for (var i = 0, m = shapeKeys.length; i < m; i++) {
            this._paintDispatch(delta, overlays, shapeKeys[i]);
        }

        this._paintOverlays(delta, overlays);
    },

    /**
     * @param {number} delta
     * @param {Array.<xss.Shape>} overlays
     * @param {string} key
     * @private
     */
    _paintDispatch: function(delta, overlays, key) {
        if (xss.shapes[key]) {
            if (xss.shapes[key].isOverlay) {
                overlays.push(xss.shapes[key]);
            } else {
                this._paintShape(xss.shapes[key], delta);
            }
        }
    },

    /**
     * @param {number} delta
     * @param {Array.<xss.Shape>} overlays
     * @private
     */
    _paintOverlays: function(delta, overlays) {
        for (var i = 0, m = overlays.length; i < m; i++) {
            this._paintShape(overlays[i], delta);
        }
    },

    /** @private */
    _frame: function(now) {
        var delta;

        // Make appointment for next paint. Quit on error.
        if (!xss.error) {
            window.requestAnimationFrame(this._frameBound, this.canvas);
        }

        // Time since last paint
        delta = now - this._prevFrame;
        this._prevFrame = now;

        // Show FPS in title bar
        this.reportFps(1000 / delta);

        this.paint(delta);
    },

    reportFps: function(fps) {
        this.fps.unshift(fps);
        this.fps.length = 10;
        document.title = 'XXSNAKE ' + Math.round(xss.util.average(this.fps));
    },

    /**
     * @param {xss.Shape} shape
     * @param {number} delta
     * @private
     */
    _paintShape: function(shape, delta) {
        var translate = shape.transform.translate;

        // Apply effects if FPS is in a normal range. If window is out
        // of focus, we don't want animations. Also we do not want anims
        // if a browser is "catching up" frames after being focused after
        // a blur, where it tries to make up for slow frames.
        if (delta > xss.MIN_FRAME_DELTA && delta < xss.MAX_FRAME_DELTA) {
            shape.applyEffects(delta);
        }

        // Draw on canvas if shape is enabled and visible
        if (!shape.enabled) {
            return;
        }

        // Create cache
        if (!shape.cache) {
            shape.cache = new xss.ShapeCache(shape, this.tile);
        }

        // Paint cached image on canvas
        this.context.drawImage(
            shape.cache.canvas,
            shape.cache.bbox.x0 + (translate[0] * this.tile.size),
            shape.cache.bbox.y0 + (translate[1] * this.tile.size)
        );
    },

    /** @private */
    _setRequestAnimationFrame: function() {
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
        window.onresize = xss.util.debounce(this._positionCanvas.bind(this));
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
        xss.event.trigger(xss.PUB_WIN_FOCUS_CHANGE, this.focus);
    },

    /**
     * @param {Event} ev
     * @private
     */
    _promoteKeyboard: function(ev) {
        if (Number(ev.which) !== 1) { // Only LMB
            return;
        }
        xss.util.instruct('No mousing please', 2000);
    },

    /** @private */
    _setCanvasDimensions: function() {
        var size = this.tile.updateSize();
        this.canvasWidth = size * xss.WIDTH;
        this.canvasHeight = size * xss.HEIGHT;
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
    },

    /**
     * @param {Event=} ev
     * @private
     */
    _positionCanvas: function(ev) {
        var windowCenter, windowMiddle, left, top, style;

        if (ev) {
            this._setCanvasDimensions();
            this._flushShapeCache();
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

    /**
     * @return {Element}
     * @private
     */
    _setupCanvas: function() {
        var canvas = document.createElement('canvas');
        document.body.appendChild(canvas);
        return canvas;
    },

    /**
     * @param {number} num
     * @return {number}
     * @private
     */
    _snapCanvasToTiles: function(num) {
        return Math.floor(num / this.tile.size) * this.tile.size;
    }

};
