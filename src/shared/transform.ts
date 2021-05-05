/**
 * @param {PixelCollection} pixels
 * @param {number=} xshift
 * @param {number=} yshift
 * @return {PixelCollection}
 */
import { PixelCollection } from "./pixelCollection";

export function shift(pixels: PixelCollection, xshift = 0, yshift = 0) {
    if (xshift === 0 && yshift === 0) {
        return pixels; // No shift
    }

    const ret = new PixelCollection();
    pixels.each(function (x, y) {
        ret.add(x + xshift, y + yshift);
    });

    return ret;
}
