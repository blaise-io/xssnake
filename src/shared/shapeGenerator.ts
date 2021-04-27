import { PixelCollection } from "./pixelCollection";
import { Shape } from "./shape";

export function lineShape(x0: number, y0: number, x1: number, y1: number): Shape {
    return new Shape(line(x0, y0, x1, y1));
}

export function radianLine(
    xc: number,
    yc: number,
    radian: number,
    length: number,
): PixelCollection {
    const x0 = xc + (length / 2) * Math.cos(radian);
    const y0 = yc + (length / 2) * Math.sin(radian);
    const x1 = xc + (length / 2) * Math.cos(radian + Math.PI);
    const y1 = yc + (length / 2) * Math.sin(radian + Math.PI);

    return line(Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1));
}

/**
 * Bresenham's line algorithm.
 */
export function line(x0: number, y0: number, x1: number, y1: number): PixelCollection {
    const pixels = new PixelCollection();
    const dx = Math.abs(x1 - x0);
    const sx = x0 < x1 ? 1 : -1;
    const dy = Math.abs(y1 - y0);
    const sy = y0 < y1 ? 1 : -1;
    let err = (dx > dy ? dx : -dy) / 2;

    pixels.add(x0, y0);

    while (x0 !== x1 || y0 !== y1) {
        const e2 = err;
        if (e2 > -dx) {
            err -= dy;
            x0 += sx;
        }
        if (e2 < dy) {
            err += dx;
            y0 += sy;
        }
        pixels.add(x0, y0);
    }

    return pixels;
}
