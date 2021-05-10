import { PixelCollection } from "../../shared/pixelCollection";
import { Shape } from "../../shared/shape";
import { line } from "../../shared/shapeGenerator";
import { shift } from "../../shared/transform";

export function outline(shape: Shape, hPadding = 10, vPadding = 10, roundedCorners = true): Shape {
    const bbox = shape.bbox();

    // Cannot have negative pixel positions, so we need to shift pixels and offset using transform.
    const offsetX = Math.abs(Math.min(bbox.x0 - hPadding - 1, 0));
    const offsetY = Math.abs(Math.min(bbox.y0 - vPadding - 1, 0));

    if (offsetX || offsetY) {
        shape.transform.translate[0] += -offsetX;
        shape.transform.translate[1] += -offsetY;
        shape.set(shift(shape.pixels, offsetX, offsetY));
        bbox.x0 += offsetX;
        bbox.y0 += offsetY;
    }

    const lw = 1;
    const x0 = bbox.x0 - hPadding - lw;
    const x1 = bbox.x1 + hPadding * 2 + lw * 2;
    const y0 = bbox.y0 - vPadding - lw;
    const y1 = bbox.y1 + vPadding * 2;
    const r = +roundedCorners;

    shape.add(
        line(x0, y0 + 1, x0, y1), // Left
        line(x0 + r, y0, x1 - r, y0), // Top
        line(x1, y0 + 1, x1, y1), // Right
        line(x0, y1, x1, y1), // Bottom
        line(x0 + r, y1 + 1, x1 - r, y1 + 1), // Bottom shadow
    );

    return shape;
}

export function zoomIn(pixels: PixelCollection, xshift = 0, yshift = 0): PixelCollection {
    const ret = new PixelCollection();

    pixels.each(function (x, y) {
        const xx = x * 2 + xshift;
        const yy = y * 2 + yshift;
        ret.add(xx, yy);
        ret.add(xx, yy + 1);
        ret.add(xx + 1, yy);
        ret.add(xx + 1, yy + 1);
    });

    return ret;
}

export function zoom(
    zoomlevel: 2 | 4,
    pixels: PixelCollection,
    shiftX = 0,
    shiftY = 0,
    antiAlising = true,
): PixelCollection {
    let zoomedPixels: PixelCollection;

    shiftX = shiftX || 0;
    shiftY = shiftY || 0;

    if (2 === zoomlevel) {
        zoomedPixels = zoomIn(pixels, shiftX, shiftY);
    } else if (4 === zoomlevel) {
        zoomedPixels = zoomIn(pixels);
        zoomedPixels = zoomIn(zoomedPixels, shiftX, shiftY);
    } else {
        return pixels; // Unsupported zoom level.
    }

    if (antiAlising) {
        pixels.each(function (x, y) {
            for (let dirX = -1; dirX <= 1; dirX += 2) {
                for (let dirY = -1; dirY <= 1; dirY += 2) {
                    handlePixel(x, y, dirX, dirY);
                }
            }
        });
    }

    function add(dirX: number, dirY: number, x: number, y: number) {
        const baseX = x * zoomlevel + shiftX;
        const baseY = y * zoomlevel + shiftY;
        if (2 === zoomlevel) {
            x = baseX + (dirX === -1 ? 0 : 1);
            y = baseY + (dirY === -1 ? 0 : 1);
            zoomedPixels.add(x, y);
        }

        if (4 === zoomlevel) {
            // Anti-aliasing in all directions.
            for (let dirX2 = -1; dirX2 <= 1; dirX2 += 2) {
                for (let dirY2 = -1; dirY2 <= 1; dirY2 += 2) {
                    if (dirX === dirX2 && dirY === dirY2) {
                        addX4s(baseX, dirX2, baseY, dirY2);
                    }
                }
            }
        }
    }

    // XX#
    //  XX
    //   X
    function addX4s(baseX: number, dirX2: number, baseY: number, dirY2: number) {
        const compX = baseX + (dirX2 === -1 ? 0 : 3);
        const compY = baseY + (dirY2 === -1 ? 0 : 3);
        zoomedPixels.add(compX, compY);
        zoomedPixels.add(compX - dirX2, compY);
        zoomedPixels.add(compX - 2 * dirX2, compY);
        zoomedPixels.add(compX - dirX2, compY - dirY2);
        zoomedPixels.add(compX, compY - dirY2);
        zoomedPixels.add(compX, compY - 2 * dirY2);
    }

    function handlePixel(x: number, y: number, dirX: number, dirY: number) {
        // !X
        // #!
        if (
            !pixels.has(x, y - dirY) &&
            !pixels.has(x + dirX, y) &&
            pixels.has(x + dirX, y - dirY)
        ) {
            add(dirX, dirY, x, y - dirY);
        }

        // !X
        // #X
        if (
            !pixels.has(x - dirX, y - dirY - dirY) &&
            !pixels.has(x - dirX, y - dirY) &&
            !pixels.has(x, y - dirY - dirY) &&
            !pixels.has(x, y - dirY) &&
            pixels.has(x + dirX, y) &&
            pixels.has(x + dirX, y - dirY) &&
            // !XX
            // #X
            // Fixes: 0
            (pixels.has(x + dirX + dirX, y - dirY) ||
                //  !X
                // !X!
                // #X
                // Fixes: z, Z, 2
                (pixels.has(x + dirX + dirX, y - dirY - dirY) &&
                    !pixels.has(x + dirX, y - dirY - dirY) &&
                    !pixels.has(x + dirX + dirX, y - dirY)) ||
                //  !X!
                //  #X!
                //   X!
                //   XO
                //    O
                // Fixes: 1, 4, M, N
                (pixels.has(x + dirX, y + dirY) &&
                    pixels.has(x + dirX, y + dirY + dirY) &&
                    !pixels.has(x - dirX, y) &&
                    !pixels.has(x + dirX + dirX, y - dirY) &&
                    !pixels.has(x + dirX + dirX, y) &&
                    !pixels.has(x + dirX + dirX, y + dirY) &&
                    (!pixels.has(x - dirX, y + dirY + dirY) || // Exclude b, d, p
                        pixels.has(x + dirX + dirX, y + dirY + dirY + dirY) || // 1
                        pixels.has(x + dirX + dirX, y + dirY + dirY)))) // 4
        ) {
            add(dirX, dirY, x, y - dirY);
        }
    }

    return zoomedPixels;
}
