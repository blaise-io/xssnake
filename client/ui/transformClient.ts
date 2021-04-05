/**
 * @param {Shape} shape
 * @param {number=} hPadding
 * @param {number=} vPadding
 * @param {boolean=} round
 * @return {Shape}
 */
import { PixelCollection } from "../../shared/pixelCollection";
import { line } from "../../shared/shapeGenerator";

export function outline(shape, hPadding = 6, vPadding = 6, round = true) {
    let r;
    let x0;
    let x1;
    let y0;
    let y1;
    let bbox = shape.bbox();

    r = round ? 1 : 0;

    hPadding = typeof hPadding === "number" ? hPadding : 6;
    vPadding = typeof vPadding === "number" ? vPadding : 6;

    // Keep in viewport
    if (bbox.y0 - vPadding < 0) {
        shape.set(shape.shift(shape.pixels, 0, vPadding - bbox.y0));
        bbox = shape.bbox();
    }

    x0 = bbox.x0 - hPadding;
    x1 = bbox.x1 + hPadding;
    y0 = bbox.y0 - vPadding;
    y1 = bbox.y1 + vPadding;

    shape.add(
        line(x0, y0 + 1, x0, y1), // Left
        line(x0 + r, y0, x1 - r, y0), // Top
        line(x1, y0 + 1, x1, y1), // Right
        line(x0, y1, x1, y1), // Bottom
        line(x0 + r, y1 + 1, x1 - r, y1 + 1) // Bottom 2
    );

    // Don't clear the missing pixel in the corners
    // because of rounded corners:
    shape.bbox(-1);

    return shape;
}

/**
 * @param {PixelCollection} pixels
 * @param {number=} xshift
 * @param {number=} yshift
 * @return {PixelCollection}
 */
export function zoomIn(pixels, xshift = 0, yshift = 0) {
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

/**
 * @param {number} zoomlevel (2 or 4)
 * @param {PixelCollection} pixels
 * @param {number=} shiftX
 * @param {number=} shiftY
 * @param {boolean=} antiAlising
 * @return {PixelCollection}
 */
export function zoom(zoomlevel, pixels, shiftX = 0, shiftY = 0, antiAlising = true) {
    let zoomedPixels;

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

    if (antiAlising !== false) {
        pixels.each(function (x, y) {
            for (let dirX = -1; dirX <= 1; dirX += 2) {
                for (let dirY = -1; dirY <= 1; dirY += 2) {
                    handlePixel(x, y, dirX, dirY);
                }
            }
        });
    }

    function add(dirX, dirY, x, y) {
        let baseY;
        let baseX;

        baseX = x * zoomlevel + shiftX;
        baseY = y * zoomlevel + shiftY;

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
    function addX4s(baseX, dirX2, baseY, dirY2) {
        let compX;
        let compY;

        compX = baseX + (dirX2 === -1 ? 0 : 3);
        compY = baseY + (dirY2 === -1 ? 0 : 3);

        zoomedPixels.add(compX, compY);
        zoomedPixels.add(compX - 1 * dirX2, compY);
        zoomedPixels.add(compX - 2 * dirX2, compY);
        zoomedPixels.add(compX - 1 * dirX2, compY - dirY2);
        zoomedPixels.add(compX, compY - dirY2);
        zoomedPixels.add(compX, compY - 2 * dirY2);
    }

    function handlePixel(x, y, dirX, dirY) {
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
