'use strict';

/**
 * Level image loader for Client
 * @param data
 * @param callback
 */
xss.levelImageLoader = function(data, callback) {
    var img = new Image();
    img.src = 'data:image/png;base64,' + data;
    img.onload = writeToCanvasForReading;

    function writeToCanvasForReading() {
        var canvas, ctx, imagedata;

        canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        imagedata = ctx.getImageData(0, 0, img.width, img.height);

        callback(imagedata);
    }
};
