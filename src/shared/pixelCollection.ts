import { BoundingBox } from "./boundingBox";
import { getRandomItemFrom, randomArrIndex, sort } from "./util";

/**
 * Store and manipulate pixels.
 * This class contains code optimized for speed.
 *
 * Shape pixels stored in a multi-dimensional array.
 * [[4, 0, 3, 9], undefined, [3, 5, 2]].
 */
export class PixelCollection {
    pixels: number[][];

    constructor(pixels = []) {
        this.pixels = pixels;
    }

    clone(): PixelCollection {
        const pixels = this.pixels;
        const clone = new PixelCollection();
        for (let i = 0, m = pixels.length; i < m; i++) {
            clone.pixels[i] = pixels[i].slice();
        }
        return clone;
    }

    add(x: number, y: number): PixelCollection {
        const pixels = this.pixels;
        if (pixels[y]) {
            pixels[y].push(x);
        } else {
            pixels[y] = [x];
        }
        return this;
    }

    bbox(): BoundingBox {
        return new BoundingBox(this);
    }

    addPairs(pairs: Coordinate[]): PixelCollection {
        for (let i = 0, m = pairs.length; i < m; i++) {
            this.add(pairs[i][0], pairs[i][1]);
        }
        return this;
    }

    sort(): PixelCollection {
        const pixels = this.pixels;
        for (let i = 0, m = pixels.length; i < m; i++) {
            if (pixels[i]) {
                sort(pixels[i]);
            }
        }
        return this;
    }

    each(callback: (x: number, y: number) => void): void {
        const pixels = this.pixels;
        for (let y = 0, m = pixels.length; y < m; y++) {
            const row = pixels[y];
            if (row) {
                for (let i = 0, mm = row.length; i < mm; i++) {
                    callback(row[i], y);
                }
            }
        }
    }

    index(x: number, y: number): number {
        const row = this.pixels[y];
        if (row) {
            for (let i = 0, m = row.length; i < m; i++) {
                if (row[i] === x) {
                    return i;
                }
            }
        }
        return -1;
    }

    has(x: number, y: number): boolean {
        return -1 !== this.index(x, y);
    }

    remove(x: number, y: number): void {
        const index = this.index(x, y);
        if (-1 !== index) {
            this.pixels[y].splice(index, 1);
        }
    }

    random(): Coordinate {
        const rowsPopulated = [];
        for (let i = 0, m = this.pixels.length; i < m; i++) {
            if (this.pixels[i].length) {
                rowsPopulated.push(i);
            }
        }
        const y = randomArrIndex(rowsPopulated);
        return [getRandomItemFrom(this.pixels[y]), y];
    }

    // removeCoordinates(...coordinates: Coordinate[]): void {
    //     for (let i = 0, m = coordinates.length; i < m; i++) {
    //         this.remove(...coordinates[i]);
    //     }
    // }

    removeLine(y: number): void {
        delete this.pixels[y];
    }
}
