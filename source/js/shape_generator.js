/*jshint globalstrict:true*/
/*globals XSS, Shape*/

'use strict';

/**
* Generates shapes
* @constructor
*/
function ShapeGenerator() {
    /** @private */
    this._cache = {};
}

ShapeGenerator.prototype = {

    /**
     * @param {string} key
     * @return {BoolPixels}
     */
    raw: function(key) {
        var raw;
        if (!this._cache[key]) {
            raw = XSS.PIXELS[key];
            this._cache[key] = this.strToBoolPixels(raw[0], raw[1]);
        }
        return this._cache[key];
    },

    /**
     * @param {number} x0
     * @param {number} y0
     * @param {number} x1
     * @param {number} y1
     * @return {Shape}
     */
    lineShape: function(x0, y0, x1, y1) {
        return new Shape(
            this.line.apply(this, arguments)
        );
    },

    /**
     * @param {number} x0
     * @param {number} y0
     * @param {number} x1
     * @param {number} y1
     * @return {ShapePixels}
     */
    line: function(x0, y0, x1, y1) {
        var pixels, dx, dy, sx, sy, err, errTmp;

        pixels = [];
        dx = Math.abs(x1 - x0);
        dy = Math.abs(y1 - y0);
        sx = x0 < x1 ? 1 : -1;
        sy = y0 < y1 ? 1 : -1;
        err = dx - dy;

        while (true) {
            pixels.push([x0, y0]);
            if (x0 === x1 && y0 === y1) {
                break;
            }
            errTmp = err;
            if (errTmp > -dx) {
                err -= dy;
                x0 += sx;
            }
            if (errTmp < dy) {
                err += dx;
                y0 += sy;
            }
        }

        return pixels;
    },

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} side
     * @param {string} text
     */
    tooltip: function(x, y, side, text) {
        var width, shape, hw, line = XSS.shapegen.line;

        width = XSS.font.width(text);

        switch (side) {
            case 0:
                shape = XSS.font.shape(x - width - 7, y - 3, text);
                // Left
                shape.add(line(x - width - 10, y - 5, x - width - 10, y + 3));
                // Top
                shape.add(line(x - width - 9, y - 6, x - 6, y - 6));
                // Bottoms
                shape.add(line(x - width - 10, y + 4, x - 5, y + 4));
                shape.add(line(x - width - 9, y + 5, x - 6, y + 5));
                // Top 1px
                shape.add(line(x - 5, y - 5, x - 5, y - 5));
                // Pointer
                shape.add(line(x - 5, y - 4, x - 2, y - 1));
                shape.add(line(x - 5, y + 2, x - 2, y - 1));
                shape.add(line(x - 5, y + 3, x - 2, y));
                break;
            //
            case 1:
                hw = Math.round(width / 2);
                shape = XSS.font.shape(x - hw, y - 12, text);
                // Top
                shape.add(line(x - hw - 2, y - 15, x + hw + 1, y - 15));
                // Left
                shape.add(line(x - hw - 3, y - 5, x - hw - 3, y - 14));
                // Bottoms
                shape.add(line(x + -hw - 2, y - 4, x + hw + 1, y - 4));
                shape.add(line(x + -hw - 2, y - 5, x + hw + 1, y - 5));
                // Right
                shape.add(line(x + hw + 2, y - 5, x + hw + 2, y - 14));
                // Pointer
                shape.add(line(x - 1, y - 1, x - 4, y - 4));
                shape.add(line(x - 1, y - 2, x - 4, y - 5));
                shape.add(line(x, y - 1, x + 3, y - 4));
                shape.add(line(x, y - 2, x + 3, y - 5));
                shape.remove(line(x - 3, y - 4, x + 3, y - 4));
                shape.remove(line(x - 3, y - 5, x + 3, y - 5));
                break;
            case 2:
                shape = XSS.font.shape(x + 8, y - 3, text);
                // Right
                shape.add(line(x + width + 10, y - 5, x + width + 10, y + 3));
                // Top
                shape.add(line(x + width + 9, y - 6, x + 6, y - 6));
                // Bottom
                shape.add(line(x + width + 10, y + 4, x + 5, y + 4));
                shape.add(line(x + width + 9, y + 5, x + 6, y + 5));
                // Top 1px
                shape.add(line(x + 5, y - 5, x + 5, y - 5));
                // Pointer
                shape.add(line(x + 5, y - 4, x + 2, y - 1));
                shape.add(line(x + 5, y + 2, x + 2, y - 1));
                shape.add(line(x + 5, y + 3, x + 2, y));
                break;
            case 3:
                hw = Math.ceil(width / 2);
                shape = XSS.font.shape(x - hw, y + 7, text);
                // Top
                shape.add(line(x + -hw - 2, y + 4, x + hw + 1, y + 4));
                // Left
                shape.add(line(x - hw - 3, y + 5, x - hw - 3, y + 14));
                // Bottoms
                shape.add(line(x - hw - 2, y + 14, x + hw + 1, y + 14));
                shape.add(line(x - hw - 2, y + 15, x + hw + 1, y + 15));
                // Right
                shape.add(line(x + hw + 2, y + 5, x + hw + 2, y + 14));
                // Pointer
                shape.add(line(x - 1, y + 1, x - 4, y + 4));
                shape.add(line(x, y + 1, x + 3, y + 4));
                shape.remove(line(x - 3, y + 4, x + 3, y + 4));
                break;
        }
        shape.clip = true;
        shape.bbox().expand(0);
        return shape;
    },

    /**
     * @return {Shape}
     */
    outerBorder: function() {
        var w = XSS.PIXELS_H - 1,
            h = XSS.PIXELS_V - 1;

        return new Shape(
            // Top
            this.line(1, 0, w - 1, 0),
            this.line(0, 1, w, 1),
            // Bottom
            this.line(1, h, w - 1, h),
            this.line(0, h - 1, w, h - 1),
            // Left
            this.line(0, 2, 0, h - 2),
            this.line(1, 2, 1, h - 2),
            // Right
            this.line(w, 2, w, h - 2),
            this.line(w - 1, 2, w - 1, h - 2)
        );
    },

    /**
     * @return {Shape}
     */
    levelBorder: function() {
        var w = XSS.PIXELS_H - 1,
            h = XSS.PIXELS_V - 1;

        return new Shape(
            this.line(0, h - 24, w, h - 24),
            this.line(0, h - 25, w, h - 25),

            XSS.font.pixels(5, h - 22, 'Imaginary crashed into Imaginary'),

            XSS.font.pixels(5, h - 15, 'Blaise'),
            XSS.font.pixels(51, h - 15, '33'),
            XSS.font.pixels(5, h - 8, 'Imaginary'),
            XSS.font.pixels(56, h - 8, '7'),

            XSS.font.pixels(65, h - 15, 'Foo'),
            XSS.font.pixels(113, h - 15, '52'),
            XSS.font.pixels(65, h - 8, 'Blabla'),
            XSS.font.pixels(118, h - 8, '2'),

            XSS.font.pixels(126, h - 22, 'Foo: :,('),
            XSS.font.pixels(126, h - 15, 'Blaise: LOL OWNED'),
            XSS.font.pixels(126, h - 8, 'Imaginary: Fuck you for cutting me!')
        );
    },

    /**
     * @param {number} x
     * @param {number} y
     * @return {Shape}
     */
    header: function(x, y) {
        y = y || 18;
        var welcome = XSS.font.pixels(0, 0, '<XSSNAKE>');
        return new Shape(
            XSS.transform.zoomX4(welcome, x, y),
            XSS.font.pixels(x, y + 20, (new Array(45)).join('+'))
        );
    },

    /**
     * @param {number} height
     * @param {string} str
     * @return {BoolPixels}
     */
    strToBoolPixels: function(height, str) {
        var arr, ret = [];
        arr = str.split('');
        for (var i = 0, m = arr.length; i < m; i++) {
            var row = Math.floor(i / (m / height));
            if (!ret[row]) {
                ret[row] = [];
            }
            ret[row].push(arr[i] === 'X');
        }
        return ret;
    },

    /**
     * @param {number} height
     * @param {string} str
     * @return {ShapePixels}
     */
    strToShapePixels: function(height, str) {
        var width, arr, ret = [];
        arr = str.split('');
        width = arr.length / height;
        for (var i = 0, m = arr.length; i < m; i++) {
            if (arr[i] === 'X') {
                ret.push([i % width, Math.floor(i / width)]);
            }
        }
        return ret;
    }

};