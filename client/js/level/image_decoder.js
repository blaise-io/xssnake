'use strict';

/**
 * Level image decoder for Client
 * @param {string} data
 * @constructor
 */
xss.level.ImageDecoder = function(data) {
    this.successFn = xss.util.noop;

    this.image = new Image();
    this.image.src = 'data:image/png;base64,' + data;
    this.image.onload = this.readFromCanvas.bind(this);
};

xss.level.ImageDecoder.prototype = {

    readFromCanvas: function() {
        var canvas, ctx, imagedata;

        canvas = document.createElement('canvas');
        canvas.width = this.image.width;
        canvas.height = this.image.height;

        ctx = canvas.getContext('2d');
        ctx.drawImage(this.image, 0, 0);

        imagedata = ctx.getImageData(0, 0, this.image.width, this.image.height);

        this.successFn(imagedata);
    },

    /**
     * @param {Function} successFn
     */
    then: function(successFn) {
        this.successFn = successFn;
    }
};
