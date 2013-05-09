/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Shape, ShapePixels*/
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
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @return {ShapePixels}
     */
    line: function(x1, y1, x2, y2) {
        var pixels, dx, dy, sx, sy, err, errTmp;

        pixels = new ShapePixels();

        dx = Math.abs(x2 - x1);
        dy = Math.abs(y2 - y1);
        sx = x1 < x2 ? 1 : -1;
        sy = y1 < y2 ? 1 : -1;

        err = dx - dy;

        while (true) {
            pixels.add(x1, y1);
            if (x1 === x2 && y1 === y2) {
                break;
            }
            errTmp = err;
            if (errTmp > -dx) {
                err -= dy;
                x1 += sx;
            }
            if (errTmp < dy) {
                err += dx;
                y1 += sy;
            }
        }

        return pixels;
    },

    /**
     * @param {string} text
     * @param {number} x
     * @param {number} y
     * @param {number} side
     * @return {Shape}
     */
    tooltip: function(text, x, y, side) {
        var width, shape, hw, line = XSS.shapegen.line;

        width = XSS.font.width(text);

        switch (side) {
            case 0:
                shape = XSS.font.shape(text, x - width - 6, y - 4);
                // Left
                shape.add(line(x - width - 9, y - 5, x - width - 9, y + 3));
                // Top
                shape.add(line(x - width - 8, y - 6, x - 6, y - 6));
                // Bottoms
                shape.add(line(x - width - 9, y + 4, x - 5, y + 4));
                shape.add(line(x - width - 8, y + 5, x - 6, y + 5));
                // Top 1px
                shape.add(line(x - 5, y - 5, x - 5, y - 5));
                // Pointer
                shape.add(line(x - 5, y - 4, x - 2, y - 1));
                shape.add(line(x - 5, y + 2, x - 2, y - 1));
                shape.add(line(x - 5, y + 3, x - 2, y));
                break;
            case 1:
                hw = Math.ceil(width / 2);
                shape = XSS.font.shape(text, x - hw, y - 13);
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
                shape = XSS.font.shape(text, x + 8, y - 4);
                // Right
                shape.add(line(x + width + 9, y - 5, x + width + 9, y + 3));
                // Top
                shape.add(line(x + width + 8, y - 6, x + 6, y - 6));
                // Bottom
                shape.add(line(x + width + 9, y + 4, x + 5, y + 4));
                shape.add(line(x + width + 8, y + 5, x + 6, y + 5));
                // Top 1px
                shape.add(line(x + 5, y - 5, x + 5, y - 5));
                // Pointer
                shape.add(line(x + 5, y - 4, x + 2, y - 1));
                shape.add(line(x + 5, y + 2, x + 2, y - 1));
                shape.add(line(x + 5, y + 3, x + 2, y));
                break;
            case 3:
                hw = Math.ceil(width / 2);
                shape = XSS.font.shape(text, x - hw, y + 6);
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
        shape.clearBBox = true;
        shape.bbox();
        return shape;
    },

    /**
     * @return {Shape}
     */
    innerBorder: function() {
        var w = XSS.WIDTH - 1,
            h = XSS.HEIGHT - 1;
        return new Shape(
            this.line(2, h - 25, w - 2, h - 25),
            this.line(2, h - 26, w - 2, h - 26)
        );
    },

    /**
     * @return {Object.<string, Shape>}
     */
    outerBorder: function() {
        var shapes = {},
            w = XSS.WIDTH - 1,
            h = XSS.HEIGHT - 1;

        // Splitting this up or it spans too big of an area
        shapes.top = new Shape(
            this.line(1, 0, w - 1, 0),
            this.line(0, 1, w, 1)
        );

        shapes.right = new Shape(
            this.line(w, 2, w, h - 2),
            this.line(w - 1, 2, w - 1, h - 2)
        );

        shapes.bottom = new Shape(
            this.line(1, h, w - 1, h),
            this.line(0, h - 1, w, h - 1)
        );

        shapes.left = new Shape(
            this.line(0, 2, 0, h - 2),
            this.line(1, 2, 1, h - 2)
        );

        return shapes;
    },

    /**
     * @return {Shape}
     */
    header: function() {
        var x, y, shape, welcome = XSS.font.pixels('<XSSNAKE>');

        x = XSS.MENU_LEFT;
        y = XSS.MENU_TOP - 34;

        shape = new Shape(XSS.transform.zoomX4(welcome, x, y, true));
        shape.add(this.line(x, y + 28, x + XSS.MENU_WIDTH, y + 28));

        return shape;
    }

};
