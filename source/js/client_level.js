/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Level, Shape, ShapePixels, LevelParser*/
'use strict';

/**
 * @param {number} id
 * @extends {Level}
 * @constructor
 */
function ClientLevel(id) {
    this.level = XSS.levelCache[id];
}

ClientLevel.prototype = Object.create(Level.prototype);

/** @lends {ClientLevel.prototype} */
XSS.util.extend(ClientLevel.prototype, {

    /**
     * @return {Shape}
     */
    getShape: function() {
        var shape, walls;

        walls = new ShapePixels(this.level.walls);

        shape = new Shape(XSS.transform.zoomGame(walls));
        shape.add(XSS.shapegen.innerBorder().pixels);

        return shape;
    },

    /**
     * @static
     */
    generateLevelCache: function() {
        XSS.levelCache = {};

        var onload = function() {
            var canvas, ctx, imagedata;

            canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;

            ctx = canvas.getContext('2d');
            ctx.drawImage(this, 0, 0);

            imagedata = ctx.getImageData(0, 0, this.width, this.height);

            XSS.levelCache[this.index] = new LevelParser(imagedata);
        };

        for (var i = 0, m = XSS.levels.length; i < m; i++) {
            var img = new Image();
            img.src = 'data:image/png;base64,' + XSS.levels[i];
            img.index = i;
            img.onload = onload;
        }
    }

});
