/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Shape*/
'use strict';

/**
 * @constructor
 */
function Font() {
    this._ctx = this._getCanvas();
    this._cache = {};
}

/** @const */ Font.MAX_WIDTH = 9;
/** @const */ Font.MAX_HEIGHT = 7;

Font.prototype = {

    /**
     * @param {string} str
     * @param {number=} x
     * @param {number=} y
     * @param {boolean=} invert
     * @return {Shape}
     */
    shape: function(str, x, y, invert) {
        var x2,
            arr = str.split(''),
            shape = new Shape();

        x = x2 = x || 0;
        y = y || 0;

        for (var i = 0, m = arr.length; i < m; i++) {
            var chrPixels = this.chrPixels(arr[i]),
                shifted = XSS.transform.shift(chrPixels.pixels, x2, y);
            shape.add(shifted);
            x2 += chrPixels.width + 2;
        }

        if (invert) {
            this._invert(shape, x, x2, y);
        }

        return shape;
    },

    /**
     * @param {string} str
     * @param {number=} x
     * @param {number=} y
     * @param {boolean=} invert
     * @return {ShapePixels}
     */
    pixels: function(str, x, y, invert) {
        return this.shape.apply(this, arguments).pixels;
    },

    /**
     * @param {string} str
     * @return {number}
     */
    width: function(str) {
        var arr = str.split(''), width = 0;
        for (var i = 0, m = arr.length; i < m; i++) {
            width += this._getChrProps(arr[i]).width;
            width += 2;
        }
        return width;
    },

    /**
     * @param chr
     * @return {Object}
     */
    chrPixels: function(chr) {
        if (!this._cache[chr]) {
            var chrProps = this._getChrProps(chr);
            this._cache[chr] = chrProps || this.chrPixels('\u25a0');
        }
        return this._cache[chr];
    },

    /**
     * @param {Shape} shape
     * @param {number} x
     * @param {number} x2
     * @param {number} y
     * @private
     */
    _invert: function(shape, x, x2, y) {
        var bbox = shape.bbox();
        bbox.x1 = x - 1;
        bbox.x2 = x2;
        bbox.y1 = y - 1;
        bbox.y2 = y + 1 + Font.MAX_HEIGHT;
        shape.invert(bbox);
    },

    /**
     * @return {CanvasRenderingContext2D}
     * @private
     */
    _getCanvas: function() {
        var canvas, context;

        canvas = document.createElement('canvas');
        canvas.width = Font.MAX_WIDTH;
        canvas.height = Font.MAX_HEIGHT;

        context = canvas.getContext('2d');
        context.font = '8px xssnake';

        return context;
    },

    /**
     * @param {string} chr
     * @return {Object}
     * @private
     */
    _getChrProps: function(chr) {
        var data, pixels = [], mw = 0, mh = 0, blurry = 0,
            w = Font.MAX_WIDTH,
            h = Font.MAX_HEIGHT;

        this._ctx.fillStyle = '#000';
        this._ctx.fillRect(0, 0, w, h);

        this._ctx.fillStyle = '#fff';
        this._ctx.fillText(chr, 0, 6);

        data = this._ctx.getImageData(0, 0, w, h).data;
        for (var i = 0, m = data.length; i < m; i += 4) {
            if (data[i] > 200) {
                var ri = i / 4,
                    x = ri % w,
                    y = Math.floor(ri / w);
                if (x > mw) { mw = x; }
                if (y > mh) { mh = y; }
                pixels.push([x, y]);
            } else if (data[i] > 100) {
                return null; // Blurry pixel = unsupported chr
            }
        }

        return {
            width : mw,
            height: mh,
            pixels: pixels,
            blurry: blurry
        };
    }

};