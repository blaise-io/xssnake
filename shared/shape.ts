/**
 * xss.Shape
 * @constructor
 * @param {...xss.PixelCollection} varArgs
 */
export class Shape {
    [x: string]: boolean;
    pixels: any;
    cache: any;
    private enabled: boolean;
    effects: any;
    expand: any;
    headers: any
    transform: any

    constructor(...pixelCollections) {
        /** @type {xss.PixelCollection} */
        this.pixels = new xss.PixelCollection();

        /** @type {xss.ShapeCache} */
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
         * @type {{translate: xss.Shift, scale: number}}
         */
        this.transform = {
            translate: [0, 0], // x,y
            scale: 1
        };

        this.add(...pixelCollections);
    }

    /**
     * @return {xss.Shape}
     */
    clone() {
        return new xss.Shape(this.pixels);
    }

    /**
     * @param {number=} hPadding
     * @param {number=} vPadding
     * @return {xss.Shape}
     */
    outline(hPadding, vPadding) {
        xss.transform.outline(this, hPadding, vPadding);
        return this;
    }

    /**
     * @param {xss.BoundingBox=} bbox
     * @return {xss.Shape}
     */
    invert(bbox) {
        var pixels = this.pixels, inverted;

        inverted = new xss.PixelCollection();
        bbox = bbox || this.bbox();

        for (var x = bbox.x0; x <= bbox.x1; x++) {
            for (var y = bbox.y0; y < bbox.y1; y++) {
                if (!pixels.has(x, y)) {
                    inverted.add(x, y);
                }
            }
        }

        return this.set(inverted);
    }

    /**
     * @return {xss.Shape}
     */
    uncache() {
        this.cache = null;
        this._bbox = null;
        return this;
    }

    /**
     * @param {...xss.PixelCollection} varArgs
     * @return {xss.Shape}
     */
    set(varArgs) {
        this.pixels = new xss.PixelCollection();
        return this.add.apply(this, arguments);
    }

    /**
     * @param {...xss.PixelCollection} pixelCollections
     * @return {xss.Shape}
     */
    add(...pixelCollections) {
        var add = this.pixels.add.bind(this.pixels);
        for (var i = 0, m = pixelCollections.length; i < m; i++) {
            arguments[i].each(add);
        }
        return this.uncache();
    }

    /**
     * @param {...xss.PixelCollection} pixels
     * @return {xss.Shape}
     */
    remove(pixels) {
        var remove = this.pixels.remove.bind(this.pixels);
        for (var i = 0, m = arguments.length; i < m; i++) {
            arguments[i].each(remove);
        }
        return this.uncache();
    }

    /**
     * @param {number=} expand
     * @return {xss.BoundingBox}
     */
    bbox(expand) {
        if (typeof expand === 'undefined') {
            expand = this.expand || 0;
        }
        if (!this._bbox || this.expand !== expand) {
            this._bbox = this.pixels.bbox();
            if (expand) {
                this._bbox.expand(expand);
            }
        }
        this.expand = expand;
        return this._bbox;
    }

};
