/*jshint globalstrict:true*/

'use strict';

/**
 * PixelEntity
 * @constructor
 * @param {...Array} var_args
 */
function PixelEntity(var_args) {
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
     * @param {...Array} var_args
     * @return {(Object|PixelEntity)}
     */
    pixels: function(var_args) {
        if (arguments.length === 0) {
            return this._pixels; // Getter
        } else {
            this._pixels = [];  // Setter
            this.add.apply(this, arguments || []);
            return this;
        }
    },

    /**
     * @param {...Array} var_args
     * @return {PixelEntity}
     */
    add: function(var_args) {
        for (var i = 0, m = arguments.length; i < m; ++i) {
            this._pixels = this._pixels.concat(arguments[i]);
        }
        delete this._cache;
        delete this._bbox;
        return this;
    },

    /**
     * @param enabled {boolean=}
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
     * @param dynamic {boolean=}
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
     * @param cache {Object=}
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