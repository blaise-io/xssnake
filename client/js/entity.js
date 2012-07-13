/*jshint globalstrict:true, sub:true*/
/*globals XSS*/

'use strict';

/**
 * Entity
 * @constructor
 */
function Entity() {
    /** @private */ this._pixels = [];
    /** @private */ this._bbox = null;
    /** @private */ this._cache = null;
    /** @private */ this._enabled = true;
    /** @private */ this._dynamic = false;

    this.addPixels.apply(this, arguments || []);
}

Entity.prototype = {

    clone: function() {
        return new Entity(this._pixels);
    },

    pixels: function() {
        if (arguments.length === 0) {
            return this._pixels; // Getter
        } else {
            this._pixels = [];  // Setter
            this.addPixels.apply(this, arguments || []);
            return this;
        }
    },

    addPixels: function() {
        for (var i = 0, m = arguments.length; i < m; ++i) {
            this._pixels = this._pixels.concat(arguments[i]);
        }
        delete this._cache;
        delete this._bbox;
        return this;
    },

    enabled: function() {
        if (arguments.length === 0) {
            return this._enabled; // Getter
        } else {
            this._enabled = arguments[0]; // Setter
            return this;
        }
    },

    dynamic: function() {
        if (arguments.length === 0) {
            return this._dynamic; // Getter
        } else {
            this._dynamic = !!arguments[0]; // Setter
            return this;
        }
    },

    cache: function() {
        if (arguments.length === 0) {
            return this._cache; // Getter
        } else {
            this._cache = arguments[0]; // Setter
            return this;
        }
    },

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