/*globals XSS*/

/**
 * Canvas
 * Display pixels
 *
 * @return {Object}
 * @constructor
 */
XSS.Canvas = function() {
    'use strict';

    var pixels = {}, // Pixels to paint

        settings   = XSS.settings,
        width      = settings.width  * settings.s, // Canvas width
        height     = settings.height * settings.s, // Canvas height
        canvas     = $('<canvas>'),                // Canvas element we're painting on
        ctx        = canvas[0].getContext('2d'),   // Drawing context

        time = +new Date(), // Keep track of fps

        getCanvasPosition = function() {
            return {
                position: 'absolute',
                left    : Math.max(0, position(($(window).width() / 2) - (width / 2))),
                top     : Math.max(0, position(($(window).height() / 2) - (height / 2)))
            };
        },

        getRealPixelBoundingBox = function(pixels) {
            var bbox = XSS.drawables.getBoundingBox(pixels);
            for (var k in bbox) {
                if (bbox.hasOwnProperty(k)) {
                    bbox[k] *= settings.s;
                }
            }
            return bbox;
        },

        position = function(number) {
            return Math.round(number / settings.s) * settings.s;
        },

        // Create a canvas on the fly and paint
        paintOffscreen = function(data) {
            var canvasTmp, bbox;

            bbox = getRealPixelBoundingBox(data);

            canvasTmp = document.createElement('canvas');
            canvasTmp.width = bbox.width;
            canvasTmp.height = bbox.height;

            paintData(canvasTmp.getContext('2d'), data, bbox);

            return {
                canvas: canvasTmp,
                bbox  : bbox
            };
        },

        // Paint data array to a canvas
        paintData = function(context, data, offset) {
            var s = settings.s,
                i = data.length;
            offset = $.extend({x: 0, y: 0}, offset);

            // Dip paint brush
            context.fillStyle = 'rgb(0,0,0)';

            while (i--) {
                context.fillRect(-offset.x + data[i][0] * s, -offset.y + data[i][1] * s, s - 1, s - 1);
            }
        },

        paintItem = function(pixels) {
            if (!pixels) {
                return false;
            }

            // Some data is dynamic, caching overhead could slow down rendering
            if (pixels.cache === false) {
                paintData(ctx, pixels.pixels, {});
            }

            // Paint offscreen and cache result
            else {
                if (!pixels.canvas) {
                    $.extend(pixels, paintOffscreen(pixels.pixels));
                    delete pixels.pixels;
                }
                ctx.drawImage(pixels.canvas, pixels.bbox.x, pixels.bbox.y);
            }
        },

        // Main paint function
        paint = function() {
            var fps,
                now = +new Date(),
                diff = now - time;

            // Make appointment for next paint
            window.requestAnimationFrame(paint, canvas[0]);

            // FPS
            fps = Math.round(1000 / diff);
            time = now;
//            if (fps > 1 && fps <= 15) {
//                console.log('low FPS');
//            }

            // Last call for animations
            XSS.doc.trigger('/xss/canvas/paint', [diff]);

            // Clear the canvas
            ctx.clearRect(0, 0, width, height);

            // Paint!
            for (var k in pixels) {
                if (pixels.hasOwnProperty(k)) {
                    paintItem(pixels[k]);
                }
            }
        };

    // Position canvas
    canvas.attr({width: width, height: height});
    canvas.css(getCanvasPosition());
    canvas.appendTo(document.body);

    // Start paint loop
    paint();

    // DOM events
    $(window).on('resize', function() {
        canvas.css(getCanvasPosition());
    });

    return {
        canvas: canvas,
        pixels: pixels
    };
};