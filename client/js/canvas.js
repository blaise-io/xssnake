/*jshint globalstrict:true, sub:true*/
/*globals XSS, PixelEntity*/

'use strict';

/**
 * Canvas drawing
 * @constructor
 */
function Canvas() {
    this.entities = {};

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
     * @param {PixelEntity} entity
     * @return {Object}
     * @private
     */
    _getBBoxRealPixels: function(entity) {
        var bbox = entity.getBBox();
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
     * @param {PixelEntity} entity
     * @return {Object}
     * @private
     */
    _paintEntityOffscreen: function(entity) {
        var bbox, canvas;

        bbox = this._getBBoxRealPixels(entity);

        canvas = document.createElement('canvas');
        canvas.setAttribute('width', bbox.width);
        canvas.setAttribute('height', bbox.height);

        this._paintEntityPixels(canvas.getContext('2d'), entity, bbox);

        return {
            canvas: canvas,
            bbox  : bbox
        };
    },

    /**
     * @param {Object} context
     * @param {PixelEntity} entity
     * @param {Object} offset
     * @private
     */
    _paintEntityPixels: function(context, entity, offset) {
        var pixels = entity.pixels();

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
     * @param {PixelEntity} entity
     * @private
     */
    _paintEntity: function(name, entity) {
        var cache;

        if (false === entity instanceof PixelEntity) {
            throw new Error(name);
        }

        if (true === entity.enabled()) {
            if (entity.dynamic()) {
                this._paintEntityPixels(this.ctx, entity, {});
            } else {
                cache = entity.cache();
                if (!cache) {
                    cache = this._paintEntityOffscreen(entity);
                    entity.cache(cache);
                }
                this.ctx.drawImage(cache.canvas, cache.bbox.x, cache.bbox.y);
            }
        }
    },

    /** @private */
    _paint: function() {
        var fps,
            now = +new Date(),
            diff = now - this.time;

        if (!XSS.error) {
            // Make appointment for next paint
            window.requestAnimationFrame(this._paint.bind(this), this.canvas);
        }

        // FPS
        fps = Math.round(1000 / diff);
        this.time = now;
        document.title = 'XXSNAKE ' + fps;

        // Last call for animations
        XSS.utils.publish('/canvas/update', diff);

        // Clear the canvas
        this.ctx.clearRect(0, 0, XSS.CANVAS_WIDTH, XSS.CANVAS_HEIGHT);

        // Paint!
        for (var k in this.entities) {
            if (this.entities.hasOwnProperty(k)) {
                this._paintEntity(k, this.entities[k]);
            }
        }
    }

};