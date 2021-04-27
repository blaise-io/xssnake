import { CANVAS } from "./const";
import { PixelCollection } from "./pixelCollection";

export class BoundingBox {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
    width: number;
    height: number;

    constructor(pixels?: PixelCollection) {
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

    expand(expand: number): BoundingBox {
        this.x0 -= expand;
        this.y0 -= expand;
        this.x1 += expand;
        this.y1 += expand;
        this.setDimensions();
        return this;
    }

    private calculate(pixels: PixelCollection): BoundingBox {
        let x0 = CANVAS.WIDTH;
        let x1 = 0;
        let y0 = CANVAS.HEIGHT;
        let y1 = 0;

        pixels.each(function (x, y) {
            if (x0 > x) {
                x0 = x;
            }
            if (x1 < x) {
                x1 = x;
            }
            if (y0 > y) {
                y0 = y;
            }
            if (y1 < y) {
                y1 = y;
            }
        });

        this.x0 = x0;
        this.x1 = x1;
        this.y0 = y0;
        this.y1 = y1;

        this.setDimensions();

        return this;
    }

    setDimensions(): void {
        this.width = this.x1 - this.x0;
        this.height = this.y1 - this.y0;
    }
}
