'use strict';

/**
 * xss.Font
 * Write texts and draw icons
 * @constructor
 */
xss.Font = function() {
    this._ctx = this._getContext();
    this._detectFontLoad();
};

/** @const */ xss.Font.MAX_WIDTH = 9;
/** @const */ xss.Font.MAX_HEIGHT = 7;
/** @const */ xss.Font.BASELINE = 6;
/** @const */ xss.Font.LINE_HEIGHT = 8;
/** @const */ xss.Font.LINE_HEIGHT_MENU = 9;
/** @const */ xss.Font.BLURRY_TRESHOLD = 3;

xss.Font.prototype = {

    _cache: {},

    /**
     * @param {string} str
     * @param {number=} x
     * @param {number=} y
     * @param {Object=} options
     * @return {xss.Shape}
     */
    shape: function(str, x, y, options) {
        var chrs, pointer, shape = new xss.Shape(), tabx1;

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

            if (chr === '\t') {
                if (tabx1) {
                    pointer.x = tabx1;
                } else {
                    pointer.x = tabx1 = this._getTabx1(str);
                }
            } else if (chr === '\n' || !nextWordFit) {
                pointer.x = 0;
                pointer.y += xss.Font.LINE_HEIGHT;
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
     * @return {xss.PixelCollection}
     */
    pixels: function(str, x, y, options) {
        return this.shape.apply(this, arguments).pixels;
    },

    height: function(str) {
        return str.split(/\n/g).length * xss.Font.LINE_HEIGHT;
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
        return [this.width(str), this.height(str) - xss.Font.LINE_HEIGHT];
    },

    /**
     * @private
     */
    _detectFontLoad: function() {
        var props = this._getChrProperties(xss.UC_HOURGLASS);
        if (props && 8 === props.width) {
            this.loaded = true;
            xss.event.trigger(xss.EV_FONT_LOAD);
        } else {
            window.setTimeout(this._detectFontLoad.bind(this), 0);
        }
    },

    /**
     * @param chr
     * @return {Object}
     * @private
     */
    _chrProperties: function(chr) {
        if (!this._cache[chr]) {
            var chrProperties = this._getChrProperties(chr);
            this._cache[chr] = chrProperties || this._chrProperties(xss.UC_SQUARE);
        }
        return this._cache[chr];
    },

    /**
     * @param {number} x
     * @param {number} y
     * @param {xss.Shape} shape
     * @param {string} chr
     * @param {Object.<string,number>} pointer
     * @return {number}
     * @private
     */
    _appendChr: function(x, y, shape, chr, pointer) {
        var chrProperties, shiftedPixels, kerning = 0;

        chrProperties = this._chrProperties(chr);

        kerning = this.getKerning(shape, pointer, chrProperties);

        shiftedPixels = xss.transform.shift(
            chrProperties.pixels,
            pointer.x + x + kerning,
            pointer.y + y
        );

        shape.add(shiftedPixels);
        return chrProperties.width + kerning;
    },

    getMaxes: function(shape, pointer) {
        var maxes = [];
        for (var i = 0; i < xss.Font.LINE_HEIGHT; i++) {
            if (shape.pixels.pixels[pointer.y + i]) {
                maxes[i] = Math.max.apply(this, shape.pixels.pixels[pointer.y + i]);
            }
        }
        return maxes;
    },

    getKerning: function(shape, pointer, chrProperties) {
        var gap, gaps = [], maxes = this.getMaxes(shape, pointer);

        for (var i = 0; i < xss.Font.LINE_HEIGHT; i++) {
            var min = null, max;
            if (chrProperties.pixels.pixels[i]) {
                min = Math.min.apply(this, chrProperties.pixels.pixels[i]);
            }
            max = Math.max(maxes[i - 1] || 0, maxes[i] || 0, maxes[i + 1] || 0);
            if (min !== null) {
                gaps.push((pointer.x - max) + min);
            }
        }

        gap = gaps.length ? Math.min.apply(this, gaps) : 2;
        return Math.max(-1, 2 - gap);
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
     * Determine X position for tab end to align a two-column table.
     * Note to future self: Does not work for more than one tab per line.
     * @param {string} str
     * @return {number}
     * @private
     */
    _getTabx1: function(str) {
        var maxtab = 0;
        var lines = str.split(/\n/g);
        for (var i = 0, m = lines.length; i < m; i++) {
            var segments = lines[i].split('\t');
            if (segments.length >= 2) {
                maxtab = Math.max(maxtab, this.width('  ' + segments[0]));
            }
        }
        return maxtab;
    },

    /**
     * @param {xss.Shape} shape
     * @param {number} y
     * @private
     */
    _invert: function(shape, y) {
        var bbox = shape.bbox();
        bbox.expand(1);
        bbox.y0 = y - 1;
        bbox.y1 = y + xss.Font.LINE_HEIGHT;
        shape.invert(bbox);
    },

    /**
     * @return {CanvasRenderingContext2D}
     * @private
     */
    _getContext: function() {
        var canvas, context, font;

        canvas = document.createElement('canvas');
        canvas.width = xss.Font.MAX_WIDTH;
        canvas.height = xss.Font.MAX_HEIGHT;

        context = canvas.getContext('2d');

        // "xssnake" is a special font that was crafted for this game.
        font = '8px xssnake';
        // Specify blurry fonts in the fallback, to make it easier to detect
        // glyphs that are (un)supported by the xssnake font.
        font += ', courier new, serif';
        context.font = font;

        return context;
    },

    /**
     * @param {string} chr
     * @return {{width: number, pixels: xss.PixelCollection}|null}
     * @private
     */
    _getChrProperties: function(chr) {
        var data, pixels = new xss.PixelCollection(), width = 0, len = 0, blurry = 0, valid,
            w = xss.Font.MAX_WIDTH,
            h = xss.Font.MAX_HEIGHT;

        // Handle whitespace characters
        if (chr.match(/\s/)) {
            return {width: 3, pixels: pixels};
        }

        this._ctx.fillStyle = '#000';
        this._ctx.fillRect(0, 0, w, h);

        this._ctx.fillStyle = '#fff';
        this._ctx.fillText(chr, 0, xss.Font.BASELINE);

        data = this._ctx.getImageData(0, 0, w, h).data;
        for (var i = 0, m = data.length; i < m; i += 4) {
            // When this does not work on some OS, try a few presets until
            // it matches a known pattern.
            if (data[i] + data[i + 1] + data[i + 2] > 650) {
                var seq = i / 4,
                    x = seq % w,
                    y = Math.floor(seq / w);
                pixels.add(x, y);
                len++;
                width = Math.max(x, width);
            } else if (data[i]) {
                blurry++;
            }
        }

        valid = len && blurry / len <= xss.Font.BLURRY_TRESHOLD;
        return (valid) ? {width: width, pixels: pixels} : null;
    }

};
