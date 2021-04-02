/**
 * @param {PixelCollection} pixels
 * @param {number=} xshift
 * @param {number=} yshift
 * @return {PixelCollection}
 */
import { PixelCollection } from "./pixelCollection";

export function shift(pixels, xshift, yshift) {
    let ret;

    if (xshift === 0 && yshift === 0) {
        return pixels; // No shift
    }

    ret = new PixelCollection();
    xshift = xshift || 0;
    yshift = yshift || 0;

    pixels.each(function(x, y) {
        ret.add(x + xshift, y + yshift);
    });

    return ret;
}
