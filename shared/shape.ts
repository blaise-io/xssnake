import { outline } from "../client/ui/transformClient";
import { BoundingBox } from "./boundingBox";
import { PixelCollection } from "./pixelCollection";

export class Shape {
    _bbox: BoundingBox
    pixels: PixelCollection
    cache: any;
    enabled: boolean;
    effects: any;
    expand: any;
    headers: any
    transform: any
    isOverlay: boolean;
    mask: null;

    lifetime: any
    flash: any

    constructor(...pixelCollections) {
        /** @type {PixelCollection} */
        this.pixels = new PixelCollection();

        /** @type {ShapeCache} */
        this.cache = null;

        /** @type {boolean} */
        this.enabled = true;

        /** @type {boolean} */
        this.isOverlay = false;

        /** @type {Object.<string,*>} */
        this.effects = {};

        /** @type {number} */
        this.expand = 0;

        /** @type {Object.<string,*>} */
        this.headers = {};

        /**
         * x0, y0, x1, y2
         * @type {Array.<number>}
         */
        this.mask = null;

        /**
         * Transform is applied at paint time, does not affect PixelCollection.
         * @type {{translate: Shift, scale: number}}
         */
        this.transform = {
            translate: [0, 0], // x,y
            scale: 1
        };

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

    /**
     * @return {Shape}
     */
    uncache() {
        this.cache = null;
        this._bbox = null;
        return this;
    }

    /**
     * @param {...PixelCollection} varArgs
     * @return {Shape}
     */
    set(varArgs) {
        this.pixels = new PixelCollection();
        return this.add.apply(this, arguments);
    }

    /**
     * @param {...PixelCollection} pixelCollections
     * @return {Shape}
     */
    add(...pixelCollections) {
        const add = this.pixels.add.bind(this.pixels);
        for (let i = 0, m = pixelCollections.length; i < m; i++) {
            arguments[i].each(add);
        }
        return this.uncache();
    }

    /**
     * @param {...PixelCollection} pixels
     * @return {Shape}
     */
    remove(pixels) {
        const remove = this.pixels.remove.bind(this.pixels);
        for (let i = 0, m = arguments.length; i < m; i++) {
            arguments[i].each(remove);
        }
        return this.uncache();
    }

    /**
     * @param {number=} expand
     * @return {BoundingBox}
     */
    bbox(expand=0) {
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
