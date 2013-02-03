/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Shape*/
'use strict';

/**
 * Font
 * Write texts and draw icons
 * @constructor
 */
function Font() {
    this._ctx = this._getCanvas();
    this.detectFontSupport();
}

/** @const */ Font.MAX_WIDTH = 9;
/** @const */ Font.MAX_HEIGHT = 7;
/** @const */ Font.BASELINE = 6;
/** @const */ Font.LINE_HEIGHT = 8;
/** @const */ Font.LINE_HEIGHT_MENU = 9;
/** @const */ Font.BLURRY_TRESHOLD = 3;

Font.prototype = {

    _cache: {},

    detectFontSupport: function() {
        if (!this._getChrProperties(XSS.UC_SQUARE)) {
            throw new Error('Cannot render xssnake font');
        }
    },

    /**
     * @param {string} str
     * @param {number=} x
     * @param {number=} y
     * @param {Object=} options
     * @return {Shape}
     */
    shape: function(str, x, y, options) {
        var chrs, pointer, shape = new Shape();

        x = x || 0;
        y = y || 0;
        pointer = {x: 0, y: 0};

        options = options || {};
        chrs = str.split('');

        for (var i = 0, m = chrs.length; i < m; i++) {
            var width, nextWordFit = true, chr = chrs[i];

            width = this._appendChr(x, y, shape, chrs[i], pointer);

            if (options.wrap && chr.match(/[\s\-]/)) {
                nextWordFit = this._nextWordFit(str, i, pointer, options.wrap);
            }

            if (chr === '\n' || !nextWordFit) {
                pointer.x = 0;
                pointer.y += Font.LINE_HEIGHT;
            } else {
                pointer.x += width + 2;
            }
        }

        if (options.invert) {
            this._invert(shape, y);
        }

        return shape;
    },

    /**
     * @param {string} str
     * @param {number=} x
     * @param {number=} y
     * @param {Object=} options
     * @return {XSS.ShapePixels}
     */
    pixels: function(str, x, y, options) {
        return this.shape.apply(this, arguments).pixels;
    },

    height: function(str) {
        return str.split(/\n/g).length * Font.LINE_HEIGHT;
    },

    /**
     * @param {string} str
     * @return {number}
     */
    width: function(str) {
        var chrs, width = 0;
        chrs = str.split('\n');
        chrs = chrs[chrs.length - 1].split('');
        for (var i = 0, m = chrs.length; i < m; i++) {
            width += this._chrProperties(chrs[i]).width;
            width += 2;
        }
        return width;
    },

    /**
     * @param str
     * @return {Array}
     */
    endPos: function(str) {
        return [this.width(str), this.height(str) - Font.LINE_HEIGHT];
    },

    /**
     * @param chr
     * @return {Object}
     * @private
     */
    _chrProperties: function(chr) {
        if (!this._cache[chr]) {
            var chrProperties = this._getChrProperties(chr);
            this._cache[chr] = chrProperties || this._chrProperties(XSS.UC_SQUARE);
        }
        return this._cache[chr];
    },

    /**
     * @param {number} x
     * @param {number} y
     * @param {Shape} shape
     * @param {string} chr
     * @param {Object.<string,number>} pointer
     * @return {number}
     * @private
     */
    _appendChr: function(x, y, shape, chr, pointer) {
        var chrProperties, shiftedPixels;

        chrProperties = this._chrProperties(chr);

        shiftedPixels = XSS.transform.shift(
            chrProperties.pixels,
            pointer.x + x,
            pointer.y + y
        );

        shape.add(shiftedPixels);
        return chrProperties.width;
    },

    /**
     * Determine whether the next word will fit on the same line or not.
     * @param {string} str
     * @param {number} i
     * @param {Object.<string,number>} pointer
     * @param {number} wrap
     * @return {boolean}
     * @private
     */
    _nextWordFit: function(str, i, pointer, wrap) {
        var nextWord = str.substr(i + 1).split(/[\s\-]/)[0];
        return (pointer.x + this.width(nextWord) <= wrap);
    },

    /**
     * @param {Shape} shape
     * @param {number} y
     * @private
     */
    _invert: function(shape, y) {
        var bbox = shape.bbox();
        bbox.expand(1);
        bbox.y1 = y - 1;
        bbox.y2 = y + Font.LINE_HEIGHT;
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

        // "xssnake" is a special font that was crafted for this game.
        context.font = '8px xssnake';

        // Specify blurry fonts in the fallback, to make it easier to detect
        // glyphs that are (un)supported by our font.
        context.font += ', "Courier New", "Times New Roman", serif';

        return context;
    },

    /**
     * @param {string} chr
     * @return {Object}
     * @private
     */
    _getChrProperties: function(chr) {
        var data, pixels = [], width = 0, blurry = 0, valid,
            w = Font.MAX_WIDTH,
            h = Font.MAX_HEIGHT;

        // Handle whitespace characters
        if (chr.match(/\s/)) {
            return {width: 1, pixels: []};
        }

        this._ctx.fillStyle = '#000';
        this._ctx.fillRect(0, 0, w, h);

        this._ctx.fillStyle = '#fff';
        this._ctx.fillText(chr, 0, Font.BASELINE);

        data = this._ctx.getImageData(0, 0, w, h).data;
        for (var i = 0, m = data.length; i < m; i += 4) {
            if (data[i] + data[i + 1] + data[i + 2] > 720) {
                var seq = i / 4,
                    x = seq % w,
                    y = Math.floor(seq / w);
                pixels.push([x, y]);
                width = Math.max(x, width);
            } else if (data[i]) {
                blurry++;
            }
        }

        valid = pixels.length && blurry / pixels.length <= Font.BLURRY_TRESHOLD;
        return (valid) ? {width: width, pixels: pixels} : null;
    }

};