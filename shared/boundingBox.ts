import { HEIGHT, WIDTH } from "./const";
import { PixelCollection } from "./pixelCollection";

/**
 * @param {PixelCollection=} pixels
 * @constructor
 */
export class BoundingBox {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
    width: number;
    height: number;

    constructor(pixels: PixelCollection) {
        this.x0 = 0;
        this.x1 = 0;
        this.y0 = 0;
        this.y1 = 0;
        this.width = 0;
        this.height = 0;

        if (pixels) {
            this.calculate(pixels);
        }
    }

    /**
     * @param {number} expand
     * @return {BoundingBox}
     */
    expand(expand) {
        this.x0 -= expand;
        this.y0 -= expand;
        this.x1 += expand;
        this.y1 += expand;
        this.setDimensions();
        return this;
    }

    /**
     * @param {PixelCollection} pixels
     * @return {BoundingBox}
     * @private
     */
    calculate(pixels) {
        let x0 = WIDTH,
            x1 = 0,
            y0 = HEIGHT,
            y1 = 0;

        pixels.each(function(x, y) {
            if (x0 > x) {x0 = x;}
            if (x1 < x) {x1 = x;}
            if (y0 > y) {y0 = y;}
            if (y1 < y) {y1 = y;}
        });

        this.x0 = x0;
        this.x1 = x1;
        this.y0 = y0;
        this.y1 = y1;

        this.setDimensions();

        return this;
    }

    setDimensions() {
        this.width = this.x1 - this.x0;
        this.height = this.y1 - this.y0;
    }

}
