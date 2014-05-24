'use strict';

/**
 * @param {{
 *     title: string,
 *     desc: string,
 *     bg: string,
 *     off: string,
 *     on: string,
 *     ghosting: number
 * }} color
 * @constructor
 */
xss.CanvasTile = function(color) {
    this.color = color;

    /** @type {HTMLCanvasElement} */
    this.on = null;
    /** @type {HTMLCanvasElement} */
    this.off = null;
    /** @type {number} */
    this.size = 0;
};

xss.CanvasTile.prototype = {

    setColor: function(color) {
        this.color = color;
        this.updatePatterns();
    },

    /**
     * @return {number}
     */
    updateSize: function() {
        var minWidth, minHeight;
        minWidth = window.innerWidth / xss.WIDTH;
        minHeight = window.innerHeight / xss.HEIGHT;
        this.size = Math.floor(Math.min(minWidth, minHeight)) || 1;
        this.updatePatterns();
        return this.size;
    },

    updatePatterns: function() {
        var canvas, backgroundImage;

        canvas = document.createElement('canvas');
        canvas.setAttribute('width', String(this.size));
        canvas.setAttribute('height', String(this.size));

        this.on = this._getTileForColor(canvas, this.color.on);
        this.off = this._getTileForColor(canvas, this.color.off);

        backgroundImage = ' url(' + canvas.toDataURL('image/png') + ')';
        document.body.style.background = this.color.bg + backgroundImage;
    },

    _getTileForColor: function(canvas, color) {
        var context, pixelSize;

        context = canvas.getContext('2d');
        // Prevent completely transparent borders for visibility.
        pixelSize = this.size === 1 ? 1 : this.size - 0.35;

        context.fillStyle = this.color.bg;
        context.fillRect(0, 0, this.size, this.size);
        context.fillStyle = color;
        context.fillRect(0, 0, pixelSize, pixelSize);

        return context.createPattern(canvas, 'repeat');
    }
};
