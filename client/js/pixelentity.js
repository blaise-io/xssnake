/*jshint globalstrict:true*/

'use strict';

/**
 * PixelEntity
 * @constructor
 * @param {...Array} varArgs
 */
function PixelEntity(varArgs) {
    /** @private */ this._pixels = [];
    /** @private */ this._bbox = null;
    /** @private */ this._cache = null;
    /** @private */ this._enabled = true;
    /** @private */ this._dynamic = false;

    this.add.apply(this, arguments || []);
}

PixelEntity.prototype = {

    /**
     * @return {PixelEntity}
     */
    clone: function() {
        return new PixelEntity(this._pixels);
    },

    /**
     * @param {...Array} varArgs
     * @return {(Array|PixelEntity)}
     */
    pixels: function(varArgs) {
        if (arguments.length === 0) {
            return this._pixels; // Getter
        } else {
            this._pixels = [];  // Setter
            this.add.apply(this, arguments || []);
            return this;
        }
    },

    /**
     * @param {...Array} varArgs
     * @return {PixelEntity}
     */
    add: function(varArgs) {
        for (var i = 0, m = arguments.length; i < m; ++i) {
            // Avoiding concat() for performance reasons
            for (var ii = 0, mm = arguments[i].length; ii < mm; ii++) {
                this._pixels.push(arguments[i][ii]);
            }
        }
        delete this._cache;
        delete this._bbox;
        return this;
    },

    /**
     * @param {boolean=} enabled
     * @return {(boolean|PixelEntity)}
     */
    enabled: function(enabled) {
        if (arguments.length === 0) {
            return this._enabled; // Getter
        } else {
            this._enabled = enabled; // Setter
            return this;
        }
    },

    /**
     * @param {boolean=} dynamic
     * @return {(boolean|PixelEntity)}
     */
    dynamic: function(dynamic) {
        if (arguments.length === 0) {
            return this._dynamic; // Getter
        } else {
            this._dynamic = dynamic; // Setter
            return this;
        }
    },

    /**
     * @param {Object=} cache
     * @return {(Object|PixelEntity)}
     */
    cache: function(cache) {
        if (arguments.length === 0) {
            return this._cache; // Getter
        } else {
            this._cache = cache; // Setter
            return this;
        }
    },

    /**
     * @return {Object}
     */
    getBBox: function() {
        if (!this._bbox) {
            this._bbox = this._getBBox();
        }
        return this._bbox;
    },

    /** @private */
    _getBBox: function() {
        var x, y,
            pixels = this._pixels,
            minX = false,
            minY = false,
            maxX = false,
            maxY = false;

        for (var i = 0, m = pixels.length; i < m; i++) {
            x = pixels[i][0];
            if (minX === false || minX > x) {
                minX = x;
            }
            if (maxX === false || maxX < x) {
                maxX = x;
            }
            y = pixels[i][1];
            if (minY === false || minY > y) {
                minY = y;
            }
            if (maxY === false || maxY < y) {
                maxY = y;
            }
        }

        return {
            x     : minX,
            y     : minY,
            x2    : maxX ? maxX + 1 : 0,
            y2    : maxY ? maxY + 1 : 0,
            width : 1 + maxX - minX,
            height: 1 + maxY - minY
        };
    }

};