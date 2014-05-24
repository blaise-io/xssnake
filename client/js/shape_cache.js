'use strict';

/**
 * Create a paintable cached version for a shape.
 * @param {xss.Shape} shape
 * @param {xss.CanvasTile} tile
 * @constructor
 */
xss.ShapeCache = function(shape, tile) {
    this.shape = shape;
    this.tile = tile;
    this.bbox = this._getBBox();
    this.canvas = this._getCanvas();
    this.context = this._getContext();
    this._paintShapePixels();
};

xss.ShapeCache.prototype = {

    _getCanvas: function() {
        var canvas = document.createElement('canvas');
        canvas.width = this.bbox.width + this.tile.size;
        canvas.height = this.bbox.height + this.tile.size;
        return canvas;
    },

    _getContext: function() {
        return this.canvas.getContext('2d');
    },

    /**
     * Group pixels by horizontal lines to save paint calls.
     * @param {xss.PixelCollection} shapePixels
     * @returns {Array.<number>} [x0, y0, width0, x1, y1, width1, ...]
     * @private
     */
    _getHorizontalLines: function(shapePixels) {
        var cache = null, lines = [];

        shapePixels.sort().each(function(x, y) {
            if (cache && x === cache[0] + cache[2] && y === cache[1]) {
                cache[2]++;
            } else {
                if (cache) {
                    lines.push(cache[0], cache[1], cache[2]);
                }
                cache = [x, y, 1];
            }
        });

        if (cache) {
            lines.push(cache[0], cache[1], cache[2]);
        }

        return lines;
    },

    _fillBackground: function() {
        var expand = this.shape.expand * this.tile.size * -1;
        this.context.fillStyle = this.tile.off;
        this.context.fillRect(
            expand,
            expand,
            this.bbox.width - expand,
            this.bbox.height - expand
        );
    },

    _paintShapePixels: function() {
        var size, lines;

        size = this.tile.size;
        lines = this._getHorizontalLines(this.shape.pixels);

        if (this.shape.isOverlay) {
            this._fillBackground();
        }

        this.context.fillStyle = this.tile.on;
        for (var i = 0, m = lines.length; i < m; i += 3) {
            this.context.fillRect(
                lines[i + 0] * size - this.bbox.x0,
                lines[i + 1] * size - this.bbox.y0,
                lines[i + 2] * size,
                size
            );
        }
    },

    /**
     * @return {xss.BoundingBox}
     * @private
     */
    _getBBox: function() {
        var pixelBBox, tileBBox, tileBBoxKeys, shape = this.shape;

        pixelBBox = shape.pixels.bbox();
        tileBBox = new xss.BoundingBox();
        tileBBoxKeys = Object.keys(pixelBBox);

        for (var i = 0, m = tileBBoxKeys.length; i < m; i++) {
            var k = tileBBoxKeys[i];
            tileBBox[k] = pixelBBox[k] * this.tile.size;
        }

        return tileBBox;
    }
};
