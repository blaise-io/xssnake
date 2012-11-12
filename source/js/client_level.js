/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Level, Shape, Utils*/
'use strict';

/**
 * @param {number} levelID
 * @extends {Level}
 * @constructor
 */
function ClientLevel(levelID) {
    this.level = XSS.levels[levelID];
}

ClientLevel.prototype = Object.create(Level.prototype);

/** @lends {ClientLevel.prototype} */
Utils.extend(ClientLevel.prototype, {

    /**
     * @return {Shape}
     */
    getShape: function() {
        var xy, pixels = [], shape, walls = this.level.walls;
        for (var i = 0, m = walls.length; i < m; i++) {
            xy = this.seqToXY(walls[i]);
            pixels.push(xy);
        }
        shape = new Shape(XSS.transform.zoomGame(pixels));
        shape.add(XSS.shapegen.outerBorder().pixels);
        shape.add(XSS.shapegen.innerBorder().pixels);
        return shape;
    }

});