import { BoundingBox } from "./boundingBox";
import { PixelCollection } from "./pixelCollection";

export class Shape {
    private bboxCache?: BoundingBox;
    pixels: PixelCollection;
    cache: unknown; // ShapeCache actually, but is only known to client.
    effects: Record<string, (delta: number) => void> = {};
    expand = 0;
    flags = { enabled: true, isOverlay: false };
    transform: { translate: [number, number]; scale: number };
    mask: number[] = [];

    constructor(...pixelCollections: PixelCollection[]) {
        this.pixels = new PixelCollection();
        this.transform = { translate: [0, 0], scale: 1 };
        this.add(...pixelCollections);
    }

    invert(bbox?: BoundingBox): Shape {
        const pixels = this.pixels;

        const inverted = new PixelCollection();
        bbox = bbox || this.bbox(this.expand);

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
        // delete this.cache;
        // delete this.bboxCache;
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

    bbox(expand = 0): BoundingBox {
        if (!this.bboxCache || this.expand !== expand) {
            this.bboxCache = this.pixels.bbox();
            if (expand) {
                this.bboxCache.expand(expand);
            }
        }
        this.expand = expand;
        return this.bboxCache;
    }
}
