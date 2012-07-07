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
    this.CANVASWIDTH =  XSS.PIXELS_H * XSS.PIXEL_SIZE;

    /** @const */
    this.CANVASHEIGHT = XSS.PIXELS_V * XSS.PIXEL_SIZE;

    this.canvas = this.setupCanvas();
    this.ctx = this.canvas[0].getContext('2d');

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
        $(window).on('resize', this.positionCanvas.bind(this));
    },

    /** @private */
    positionCanvas: function() {
        this.canvas.css(this.getCanvasPosition());
    },

    /** @private */
    setupCanvas: function() {
        var canvas;
        canvas = $('<canvas>').appendTo(XSS.doc);
        canvas.attr({width: this.CANVASWIDTH, height: this.CANVASHEIGHT});
        return canvas;
    },

    /** @private */
    getCanvasPosition: function() {
        return {
            position: 'absolute',
            left    : Math.max(0, this.snapToFatPixels(($(window).width() / 2)  - (this.CANVASWIDTH / 2))),
            top     : Math.max(0, this.snapToFatPixels(($(window).height() / 2) - (this.CANVASHEIGHT / 2)))
        };
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
        var canvasTmp, bbox;

        bbox = this.getBoundingBoxInPixels(data);

        canvasTmp = document.createElement('canvas');
        canvasTmp.width = bbox.width;
        canvasTmp.height = bbox.height;

        this.paintData(canvasTmp.getContext('2d'), data, bbox);

        return {
            canvas: canvasTmp,
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
                object = $.extend(object, this.paintOffscreen(object.pixels));
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
        window.requestAnimationFrame(this.paint.bind(this), this.canvas[0]);

        // FPS
        fps = Math.round(1000 / diff);
        this.time = now;
        if (fps > 1 && fps <= 15) {
            console.log('low FPS');
        }

        // Last call for animations
        XSS.doc.trigger('/xss/canvas/paint', [diff]);

        // Clear the canvas
        this.ctx.clearRect(0, 0, this.CANVASWIDTH, this.CANVASHEIGHT);

        // Paint!
        for (var k in this.objects) {
            if (this.objects.hasOwnProperty(k)) {
                this.paintItem(k, this.objects[k]);
            }
        }
    }

};