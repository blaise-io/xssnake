import { BoundingBox } from "../../../shared/boundingBox";
import { PixelCollection } from "../../../shared/pixelCollection";
import { Shape } from "../../../shared/shape";
import { CanvasTile } from "./canvasTile";

export class ShapeCache {
    bbox: BoundingBox;
    canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    constructor(public shape: Shape, public tile: CanvasTile) {
        this.bbox = this._getBBox();
        this.canvas = this._getCanvas();
        this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        this._paintShapePixels();
    }

    _getCanvas(): HTMLCanvasElement {
        const canvas = document.createElement("canvas");
        canvas.width = this.bbox.width + this._getSize();
        canvas.height = this.bbox.height + this._getSize();
        return canvas;
    }

    /**
     * Save paint calls by merging pixels.
     * First to lines, then combine lines to rectangles.
     * Balance processing costs with paint saving costs.
     */
    _mergePixels(shapePixels: PixelCollection): number[][] {
        const lines = this._getLines(shapePixels);
        return this._getRectangles(lines);
    }

    private _getLines(pixels: PixelCollection): [number, number, number][] {
        let cache: [number, number, number] | undefined;
        const lines: [number, number, number][] = [];

        pixels.sort().each(function (x, y) {
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

    private _getRectangles(lines: number[][]): number[][] {
        let cache = undefined;
        const rectangles = [];

        lines.sort(function (a, b) {
            return a[0] - b[0];
        });

        for (let i = 0, m = lines.length; i < m; i++) {
            // cache: x,y,w,h
            if (
                cache &&
                lines[i][0] === cache[0] &&
                lines[i][1] === cache[1] + cache[3] &&
                lines[i][2] === cache[2]
            ) {
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

    _fillBackground(): void {
        const expand = this.shape.expand * this.tile.size * -1;
        this.context.fillStyle = this.tile.off as CanvasPattern;
        this.context.fillRect(
            expand,
            expand,
            this.bbox.width + this.tile.size - expand,
            this.bbox.height + this.tile.size - expand,
        );
    }

    _getSize(): number {
        return this.tile.size * this.shape.transform.scale;
    }

    _paintShapePixels(): void {
        const size = this._getSize();
        const rectangles = this._mergePixels(this.shape.pixels);

        if (this.shape.flags.isOverlay) {
            this._fillBackground();
        }

        this.context.fillStyle = this.tile.on as CanvasPattern;
        for (let i = 0, m = rectangles.length; i < m; i++) {
            this.context.fillRect(
                rectangles[i][0] * size - this.bbox.x0,
                rectangles[i][1] * size - this.bbox.y0,
                rectangles[i][2] * size,
                rectangles[i][3] * size,
            );
        }
    }

    private _getBBox(): BoundingBox {
        const size = this._getSize();
        const pixelBBox = this.shape.pixels.bbox();
        const tileBBox = new BoundingBox();

        tileBBox.x0 = pixelBBox.x0 * size;
        tileBBox.x1 = pixelBBox.x1 * size;
        tileBBox.y0 = pixelBBox.y0 * size;
        tileBBox.y1 = pixelBBox.y1 * size;
        tileBBox.width = pixelBBox.width * size;
        tileBBox.height = pixelBBox.height * size;

        return tileBBox;
    }
}
