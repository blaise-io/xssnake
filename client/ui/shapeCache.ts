/**
 * Create a paintable cached version for a shape.
 * @param {Shape} shape
 * @param {CanvasTile} tile
 * @constructor
 */
import { BoundingBox } from "../../shared/boundingBox";
import { Shape } from "../../shared/shape";
import { CanvasTile } from "./canvasTile";

export class ShapeCache {
    private bbox: BoundingBox;
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    constructor(public shape: Shape, public tile: CanvasTile) {
        this.bbox = this._getBBox();
        this.canvas = this._getCanvas();
        this.context = this.canvas.getContext("2d");
        this._paintShapePixels();
    }

    _getCanvas() {
        const canvas = document.createElement("canvas");
        canvas.width = this.bbox.width + this._getSize();
        canvas.height = this.bbox.height + this._getSize();
        return canvas;
    }

    /**
     * Save paint calls by merging pixels.
     * First to lines, then combine lines to rectangles.
     * Belance processing costs with paint saving costs.
     *
     * @param {PixelCollection} shapePixels
     * @return {Array.<Array.<number>>}
     * @private
     */
    _mergePixels(shapePixels)): void {
        const lines = this._getLines(shapePixels);
        return this._getRectangles(lines);
    }

    /**
     * Group pixels to horizontal lines.
     * @param {PixelCollection} shapePixels
     * @return {Array.<Array.<number>>}
     * @private
     */
    _getLines(shapePixels)): void {
        let cache = null; const lines = [];

        shapePixels.sort().each(function(x, y) {
            // cache: x,y,w
            if (cache && x === cache[0] + cache[2] && y === cache[1]) {
                cache[2]++;
            } else {
                if (cache) {
                    lines.push(cache);
                }
                cache = [x, y, 1];
            }
        });

        if (cache) {
            lines.push(cache);
        }

        return lines;
    }

    /**
     * Group pixels to rectangles.
     * @param {Array.<Array.<number>>} lines
     * @return {Array.<Array.<number>>}
     * @private
     */
    _getRectangles(lines)): void {
        let cache = null; const rectangles = [];

        lines.sort(function(a, b) {
            return a[0] - b[0];
        });

        for (let i = 0, m = lines.length; i < m; i++) {
            // cache: x,y,w,h
            if (cache &&
                lines[i][0] === cache[0] &&
                lines[i][1] === cache[1] + cache[3] &&
                lines[i][2] === cache[2]) {
                cache[3]++;
            } else {
                if (cache) {
                    rectangles.push(cache);
                }
                cache = lines[i];
                cache.push(1);
            }
        }

        if (cache) {
            rectangles.push(cache);
        }

        return rectangles;
    }

    _fillBackground() {
        const expand = this.shape.expand * this.tile.size * -1;
        this.context.fillStyle = this.tile.off;
        this.context.fillRect(
            expand,
            expand,
            this.bbox.width + this.tile.size - expand,
            this.bbox.height + this.tile.size - expand
        );
    }

    _getSize() {
        return this.tile.size * this.shape.transform.scale;
    }

    _paintShapePixels() {
        const size = this._getSize(); let rectangles;

        rectangles = this._mergePixels(this.shape.pixels);

        if (this.shape.isOverlay) {
            this._fillBackground();
        }

        this.context.fillStyle = this.tile.on;
        for (let i = 0, m = rectangles.length; i < m; i++) {
            this.context.fillRect(
                rectangles[i][0] * size - this.bbox.x0,
                rectangles[i][1] * size - this.bbox.y0,
                rectangles[i][2] * size,
                rectangles[i][3] * size
            );
        }
    }

    /**
     * @return {BoundingBox}
     * @private
     */
    _getBBox() {
        let size; let pixelBBox; let tileBBox; let tileBBoxKeys;

        size = this._getSize();
        pixelBBox = this.shape.pixels.bbox();
        tileBBox = new BoundingBox();
        tileBBoxKeys = Object.keys(pixelBBox);

        for (let i = 0, m = tileBBoxKeys.length; i < m; i++) {
            const k = tileBBoxKeys[i];
            tileBBox[k] = pixelBBox[k] * size;
        }

        return tileBBox;
    }
}
