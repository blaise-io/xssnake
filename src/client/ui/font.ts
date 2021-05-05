import { PixelCollection } from "../../shared/pixelCollection";
import { Shape } from "../../shared/shape";
import { shift } from "../../shared/transform";
import { UC } from "../const";

export const MAX_WIDTH = 9;
export const MAX_HEIGHT = 7;
export const BASELINE = 6;
export const LINE_HEIGHT = 8;
export const LINE_HEIGHT_MENU = 9;
export const BLURRY_TRESHOLD = 3;

const _cache: Record<string, { width: number; pixels: PixelCollection }> = {};
const _ctx = _getContext();

export type FontOptions = {
    wrap?: number;
    invert?: boolean;
};

export function font(str: string, x = 0, y = 0, options: FontOptions = {}): Shape {
    let tabx1;

    const shape = new Shape();
    const pointer = { x: 0, y: 0 };

    const chrs = str.split("");

    for (let i = 0, m = chrs.length; i < m; i++) {
        let nextWordFit = true;
        const chr = chrs[i];
        const width = _appendChr(x, y, shape, chrs[i], pointer);

        if (options.wrap && chr.match(/[\s-]/)) {
            nextWordFit = _nextWordFit(str, i, pointer, options.wrap);
        }

        if (chr === "\t") {
            if (tabx1) {
                pointer.x = tabx1;
            } else {
                pointer.x = tabx1 = _getTabx1(str);
            }
        } else if (chr === "\n" || !nextWordFit) {
            pointer.x = 0;
            pointer.y += LINE_HEIGHT;
        } else {
            pointer.x += width + 2;
        }
    }

    if (options.invert) {
        _invert(shape, y);
    }

    return shape;
}

export function fontPixels(str: string, x = 0, y = 0, options: FontOptions = {}): PixelCollection {
    return font(str, x, y, options).pixels;
}

export function fontHeight(str: string, x = 0, y = 0, options: FontOptions = {}): number {
    const LH = LINE_HEIGHT;
    const height = font(str, x, y, options).pixels.pixels.length + 1; // Don't allow absence of font descenders affect height.
    const remainder = LH - ((height - (y || 0)) % LH || LH);
    return height + remainder;
}

export function fontWidth(str: string, x = 0, y = 0, options: FontOptions = {}): number {
    const maxes = [0];
    const pixels = font(str, x, y, options).pixels;
    for (let i = pixels.pixels.length - LINE_HEIGHT + 1, m = pixels.pixels.length; i < m; i++) {
        if (pixels.pixels[i]) {
            maxes.push(Math.max.apply(this, pixels.pixels[i]));
        }
    }
    let width = Math.max.apply(this, maxes) + 2; // Ends with a space. Ending with multiple spaces not supported.
    if (" " === str.slice(-1)) {
        width += 3;
    }
    return width;
}

// Get width, ignores kerning.
export function fastWidth(str: string): number {
    let width = 0;
    let chrs = str.split("\n");
    chrs = chrs[chrs.length - 1].split("");
    for (let i = 0, m = chrs.length; i < m; i++) {
        width += _chrProperties(chrs[i]).width;
        width += 2;
    }
    return width;
}

export function fontEndPos(
    str: string,
    x: number,
    y: number,
    options: FontOptions = {},
): [number, number] {
    return [fontWidth(str, x, y, options), fontHeight(str, x, y, options) - LINE_HEIGHT];
}

function _chrProperties(chr: string): { width: number; pixels: PixelCollection } {
    if (!_cache[chr]) {
        const chrProperties = _getChrProperties(chr);
        _cache[chr] = chrProperties || _chrProperties(UC.SQUARE);
    }
    return _cache[chr];
}

/**
 * @param {number} x
 * @param {number} y
 * @param {Shape} shape
 * @param {string} chr
 * @param {Object.<string,number>} pointer
 * @return {number}
 * @private
 */
function _appendChr(
    x: number,
    y: number,
    shape: Shape,
    chr: string,
    pointer: { x: number; y: number },
) {
    let kerning = 0;

    const chrProperties = _chrProperties(chr);
    if (pointer.x) {
        kerning = getKerning(x, y, shape, pointer, chrProperties);
    }

    const shiftedPixels = shift(chrProperties.pixels, pointer.x + x + kerning, pointer.y + y);
    shape.add(shiftedPixels);
    return chrProperties.width + kerning;
}

export function getMaxes(
    x: number,
    y: number,
    shape: Shape,
    pointer: { x: number; y: number },
): number[] {
    const maxes = [];
    for (let i = 0; i < LINE_HEIGHT; i++) {
        if (shape.pixels.pixels[y + pointer.y + i]) {
            maxes[i] = Math.max.apply(this, shape.pixels.pixels[y + pointer.y + i]) - x;
        }
    }
    return maxes;
}

export function getKerning(
    x: number,
    y: number,
    shape: Shape,
    pointer: { x: number; y: number },
    chrProperties: { width: number; pixels: PixelCollection },
): number {
    const gaps = [];
    const maxes = getMaxes(x, y, shape, pointer);

    for (let i = 0; i < LINE_HEIGHT; i++) {
        let min;
        if (chrProperties.pixels.pixels[i]) {
            min = Math.min.apply(this, chrProperties.pixels.pixels[i]);
        }
        const max = Math.max(maxes[i - 1] || 0, maxes[i] || 0, maxes[i + 1] || 0);
        if (min !== undefined) {
            gaps.push(pointer.x - max + min);
        }
    }

    const gap = Math.min.apply(this, gaps);
    return Math.max(-1, 2 - gap);
}

/**
 * Determine whether the next word will fit on the same line or not.
 * @param {string} str
 * @param {number} i
 * @param {Object.<string,number>} pointer
 * @param {number} wrap
 * @return {boolean}
 * @private
 */
function _nextWordFit(str, i, pointer, wrap) {
    const nextWord = str.substr(i + 1).split(/[\s-]/)[0];
    return pointer.x + fastWidth(nextWord) <= wrap;
}

/**
 * Determine X position for tab end to align a two-column table.
 * Note to future self: Does not work for more than one tab per line.
 * @param {string} str
 * @return {number}
 * @private
 */
function _getTabx1(str) {
    let maxtab = 0;
    const lines = str.split(/\n/g);
    for (let i = 0, m = lines.length; i < m; i++) {
        const segments = lines[i].split("\t");
        if (segments.length >= 2) {
            maxtab = Math.max(maxtab, fontWidth("  " + segments[0]));
        }
    }
    return maxtab;
}

/**
 * @param {Shape} shape
 * @param {number} y
 * @private
 */
function _invert(shape, y) {
    const bbox = shape.bbox();
    bbox.expand(1);
    bbox.y0 = y - 1;
    bbox.y1 = y + LINE_HEIGHT;
    shape.invert(bbox);
}

function _getContext(): CanvasRenderingContext2D {
    const canvas = document.createElement("canvas");
    canvas.width = MAX_WIDTH;
    canvas.height = MAX_HEIGHT;

    const context = canvas.getContext("2d"); // "xssnake" is a special font that was crafted for this game.
    let font = "8px xssnake"; // Specify blurry fonts in the fallback, to make it easier to detect // glyphs that are (un)supported by the xssnake font.
    font += ", courier new, serif";
    context.font = font;

    return context;
}

function _getChrProperties(chr: string): { width: number; pixels: PixelCollection } {
    const pixels = new PixelCollection();
    let width = 0;
    let len = 0;
    let blurry = 0;
    const w = MAX_WIDTH;
    const h = MAX_HEIGHT;

    // Handle whitespace characters
    if (chr.match(/\s/)) {
        return { width: 3, pixels: pixels };
    }

    _ctx.fillStyle = "#000";
    _ctx.fillRect(0, 0, w, h);

    _ctx.fillStyle = "#fff";
    _ctx.fillText(chr, 0, BASELINE);

    const data = _ctx.getImageData(0, 0, w, h).data;
    for (let i = 0, m = data.length; i < m; i += 4) {
        // When this does not work on some OS, try a few presets until
        // it matches a known pattern.
        if (data[i] + data[i + 1] + data[i + 2] > 650) {
            const seq = i / 4;
            const x = seq % w;
            const y = Math.floor(seq / w);
            pixels.add(x, y);
            len++;
            width = Math.max(x, width);
        } else if (data[i]) {
            blurry++;
        }
    }

    const valid = len && blurry / len <= BLURRY_TRESHOLD;
    return valid ? { width: width, pixels: pixels } : undefined;
}

export function fontLoad(): Promise<void> {
    return new Promise((resolve) => {
        const interval = window.setInterval(() => {
            const props = _getChrProperties(UC.HOURGLASS);
            if (props && props.width === 8) {
                window.clearInterval(interval);
                resolve();
            }
        });
    });
}
