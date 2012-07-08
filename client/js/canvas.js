/*jshint globalstrict:true, sub:true*/
/*globals XSS*/

'use strict';

/**
 * Canvas drawing
 * @constructor
 */
function Canvas() {
    this.objects = {};

    /** @const */
    this.CANVAS_WIDTH =  XSS.PIXELS_H * XSS.PIXEL_SIZE;

    /** @const */
    this.CANVAS_HEIGHT = XSS.PIXELS_V * XSS.PIXEL_SIZE;

    this.canvas = this.setupCanvas();
    this.ctx = this.canvas.getContext('2d');

    this.setRequestAnimationFrame();
    this.positionCanvas();
    this.addEventHandlers();
    this.paint();
}

Canvas.prototype = {

    /** @private */
    setRequestAnimationFrame: function() {
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
    addEventHandlers: function() {
        window.onresize = this.positionCanvas.bind(this);
    },

    /** @private */
    positionCanvas: function() {
        var windowCenter, windowMiddle, left, top, style;

        windowCenter = window.innerWidth / 2;
        windowMiddle = window.innerHeight / 2;

        left = this.snapToFatPixels(windowCenter - (this.CANVAS_WIDTH / 2));
        top = this.snapToFatPixels(windowMiddle - (this.CANVAS_HEIGHT / 2));

        style = this.canvas.style;
        style.position = 'absolute';
        style.left = Math.max(0, left) + 'px';
        style.top = Math.max(0, top) + 'px';
    },

    /** @private */
    setupCanvas: function() {
        var canvas = document.createElement('canvas');
        canvas.setAttribute('width', this.CANVAS_WIDTH);
        canvas.setAttribute('height', this.CANVAS_HEIGHT);
        XSS.doc.appendChild(canvas);
        return canvas;
    },

    /** @private */
    getBoundingBoxInPixels: function(pixels) {
        var bbox = XSS.drawables.getBoundingBox(pixels);
        for (var k in bbox) {
            if (bbox.hasOwnProperty(k)) {
                bbox[k] *= XSS.PIXEL_SIZE;
            }
        }
        return bbox;
    },

    /** @private */
    snapToFatPixels: function(number) {
        return Math.round(number / XSS.PIXEL_SIZE) * XSS.PIXEL_SIZE;
    },

    /** @private */
    paintOffscreen: function(data) {
        var bbox, canvas;

        bbox = this.getBoundingBoxInPixels(data);

        canvas = document.createElement('canvas');
        canvas.setAttribute('width', bbox.width);
        canvas.setAttribute('height', bbox.height);

        this.paintData(canvas.getContext('2d'), data, bbox);

        return {
            canvas: canvas,
            bbox  : bbox
        };
    },

    /** @private */
    paintData: function(context, data, offset) {
        var s = XSS.PIXEL_SIZE,
            i = data.length;

        offset.x = offset.x || 0;
        offset.y = offset.y || 0;

        // Dip paint brush
        context.fillStyle = 'rgb(0,0,0)';

        while (i--) {
            context.fillRect(-offset.x + data[i][0] * s, -offset.y + data[i][1] * s, s - 1, s - 1);
        }
    },

    /** @private */
    paintItem: function(name, object) {
        var offscreen;

        if (!object) {
            throw new Error('Empty object: ' + name);
        }

        else if (!object.pixels && !object.canvas) {
            throw new Error('Cannot draw ' + name + ': ' + JSON.stringify(object));
        }

        // Some objects are very dynamic, avoid caching overhead
        if (object.cache === false) {
            this.paintData(this.ctx, object.pixels, {});
        }

        // Paint offscreen and cache result
        else {
            if (!object.canvas) {
                offscreen = this.paintOffscreen(object.pixels);
                object.canvas = offscreen.canvas;
                object.bbox = offscreen.bbox;
                delete object.pixels;
            }
            this.ctx.drawImage(object.canvas, object.bbox.x, object.bbox.y);
        }
    },

    /** @private */
    paint: function() {
        var fps,
            now = +new Date(),
            diff = now - this.time;

        // Make appointment for next paint
        window.requestAnimationFrame(this.paint.bind(this), this.canvas);

        // FPS
        fps = Math.round(1000 / diff);
        this.time = now;
        document.title = 'XXSNAKE ' + fps;

        // Last call for animations
        XSS.utils.publish('/canvas/paint', diff);

        // Clear the canvas
        this.ctx.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

        // Paint!
        for (var k in this.objects) {
            if (this.objects.hasOwnProperty(k)) {
                this.paintItem(k, this.objects[k]);
            }
        }
    }

};