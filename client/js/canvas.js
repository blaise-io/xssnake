/*global XSS: true */

XSS.Canvas = function() {
    'use strict';

    var paintables = {},                           // Data to paint

        settings   = XSS.settings,
        width      = settings.width  * settings.s, // Canvas width
        height     = settings.height * settings.s, // Canvas height
        canvas     = $('<canvas>'),                // Canvas element we're painting on
        ctx        = canvas[0].getContext('2d'),   // Drawing context

        time       = +new Date(),                  // Keep track of fps

        getCanvasPosition = function() {
            return {
                position: 'absolute',
                left: Math.max(0, position(($(window).width()  / 2) - (width / 2))),
                top:  Math.max(0, position(($(window).height() / 2) - (height / 2)))
            };
        },

        position = function(number) {
            return Math.round(number / settings.s) * settings.s;
        },


        // Create a canvas on the fly and paint
        paintOffscreen = function(data) {
            var canvasTmp;

            canvasTmp = document.createElement('canvas');
            canvasTmp.width = width;
            canvasTmp.height = height;

            paintData(canvasTmp.getContext('2d'), data);

            return canvasTmp;
        },

        // Paint data array to a canvas
        paintData = function(context, data) {
            var s = settings.s,
                i = data.length;
            while (i--) {
                context.fillRect(data[i][0] * s, data[i][1] * s, s-1, s-1);
            }
        },

        // Main paint function
        paint = function() {
            var fps,
                now = +new Date(),
                diff = now - time;

            // Make appointment for next paint
            window.requestAnimationFrame(paint);

            // FPS
            fps = Math.round(1000 / diff);
            time = now;

            // OHSHI
            if (fps < 15) {
                console.warn('Slow FPS:', fps, ', Pixels:', paintables.toSource().length);
            }

            // Clear ze canvas
            ctx.clearRect(0, 0, width, height);

            // Last call for animations
            $(document).trigger('/xss/canvas/paint', [diff]);

            // Paint!
            for (var k in paintables) {
                if (paintables.hasOwnProperty(k) && paintables[k]) {

                    ctx.globalAlpha = paintables[k].opacity || 1;

                    // Some data is dynamic, caching overhead could slow down rendering
                    if (paintables[k].cache === false) {
                        paintData(ctx, paintables[k].pixels);
                    }

                    // Offscreen painting + caching output when possible
                    // Throw array array data
                    else {
                        if (!paintables[k].canvas) {
                            paintables[k] = {
                                canvas: paintOffscreen(paintables[k].pixels)
                            };
                        }
                        ctx.drawImage(paintables[k].canvas, 0, 0);
                    }
                }
            }
        };

    // Position canvas
    canvas.attr({width:width, height:height});
    canvas.css(getCanvasPosition());
    canvas.appendTo(document.body);

    // Prepare paint brush
    ctx.fillStyle = '#000';

    // Paint loop
    window.requestAnimationFrame(paint, canvas);

    // DOM events
    $(window).on('resize', function() {
        canvas.css(getCanvasPosition());
    });

    return {
        canvas: canvas,
        paintables: paintables
    };

};