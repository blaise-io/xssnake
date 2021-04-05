import { ShapeCache } from "../client/ui/shapeCache";
import { outline } from "../client/ui/transformClient";
import { BoundingBox } from "./boundingBox";
import { PixelCollection } from "./pixelCollection";

export class Shape {
    _bbox: BoundingBox
    pixels: PixelCollection
    cache: ShapeCache = null;
    enabled: boolean;
    effects: Record<string, (delta) => void> = {};
    expand = 0;
    flags: Record<string, boolean> = {
        enabled: true,
        isOverlay: false,
    }
    transform: {translate: [number,number], scale: number}
    isOverlay: boolean;
    mask: number[]=null;

    constructor(...pixelCollections: PixelCollection[]) {
        this.pixels = new PixelCollection();
        this.transform = {translate: [0, 0], scale: 1};
        this.add(...pixelCollections);
    }

    clone(): Shape {
        return new Shape(this.pixels);
    }

    outline(hPadding=0, vPadding=0): Shape {
        outline(this, hPadding, vPadding);
        return this;
    }

    invert(bbox?: BoundingBox): Shape {
        const pixels = this.pixels;

        const inverted = new PixelCollection();
        bbox = bbox || this.bbox();

        for (let x = bbox.x0; x <= bbox.x1; x++) {
            for (let y = bbox.y0; y < bbox.y1; y++) {
                if (!pixels.has(x, y)) {
                    inverted.add(x, y);
                }
            }
        }

        return this.set(inverted);
    }

    uncache(): Shape {
        this.cache = null;
        this._bbox = null;
        return this;
    }

    set(...pixelCollections: PixelCollection[]): Shape {
        this.pixels = new PixelCollection();
        return this.add(...pixelCollections);
    }

    add(...pixelCollections: PixelCollection[]): Shape {
        const add = this.pixels.add.bind(this.pixels);
        for (let i = 0, m = pixelCollections.length; i < m; i++) {
            pixelCollections[i].each(add);
        }
        return this.uncache();
    }

    remove(...pixelCollections: PixelCollection[]): Shape {
        const remove = this.pixels.remove.bind(this.pixels);
        for (let i = 0, m = pixelCollections.length; i < m; i++) {
            pixelCollections[i].each(remove);
        }
        return this.uncache();
    }

    /**
     * @param {number=} expand
     * @return {BoundingBox}
     */
    bbox(expand=0): BoundingBox {
        if (!this._bbox || this.expand !== expand) {
            this._bbox = this.pixels.bbox();
            if (expand) {
                this._bbox.expand(expand);
            }
        }
        this.expand = expand;
        return this._bbox;
    }

}
