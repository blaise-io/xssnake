import { PixelCollection } from "./pixelCollection";
import { Shape } from "./shape";

export function lineShape(x0: number, y0: number, x1: number, y1: number): Shape {
    return new Shape(line(x0, y0, x1, y1));
}

export function radianLine(
    xc: number,
    yc: number,
    radian: number,
    length: number
): PixelCollection {
    const x0 = xc + (length / 2) * Math.cos(radian);
    const y0 = yc + (length / 2) * Math.sin(radian);
    const x1 = xc + (length / 2) * Math.cos(radian + Math.PI);
    const y1 = yc + (length / 2) * Math.sin(radian + Math.PI);

    return line(Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1));
}

/**
 * Bresenham's line algorithm
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @return {PixelCollection}
 */
export function line(x0, y0, x1, y1) {
    let pixels;
    let dx;
    let sx;
    let dy;
    let sy;
    let err;
    let err2;

    pixels = new PixelCollection();

    dx = Math.abs(x1 - x0);
    sx = x0 < x1 ? 1 : -1;
    dy = Math.abs(y1 - y0);
    sy = y0 < y1 ? 1 : -1;
    err = (dx > dy ? dx : -dy) / 2;

    while (true) {
        pixels.add(x0, y0);
        if (x0 === x1 && y0 === y1) {
            break;
        }
        err2 = err;
        if (err2 > -dx) {
            err -= dy;
            x0 += sx;
        }
        if (err2 < dy) {
            err += dx;
            y0 += sy;
        }
    }

    return pixels;
}
