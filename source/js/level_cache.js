/*jshint globalstrict:true, es5:true, expr:true, sub:true*/
/*globals XSS, CONST, LevelData*/
'use strict';

/**
 * @constructor
 */
function LevelCache() {
    /** @type {Array.<LevelData>} */
    this._cache = [];
    this._generateLevelCache();
}

LevelCache.prototype = {

    /**
     * @return {LevelData}
     */
    levelData: function(id) {
        return this._cache[id];
    },

    /**
     * @private
     */
    _generateLevelCache: function() {
        for (var i = 0, m = XSS.levels.length; i < m; i++) {
            this._loadImage(i);
        }
    },

    /**
     * @param {number} index
     * @private
     */
    _loadImage: function(index) {
        var img = new Image();
         img.src = 'data:image/png;base64,' + XSS.levels[index];
         img.onload = function() {
             this._cache[index] = this._onImageLoad(index, img);
         }.bind(this);
    },

    /**
     * @param {number} index
     * @param {HTMLImageElement} img
     * @return {LevelData}
     * @private
     */
    _onImageLoad: function(index, img) {
        var canvas, ctx, imagedata;

        canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        imagedata = ctx.getImageData(0, 0, img.width, img.height);
        return new LevelData(imagedata);
    }
};
