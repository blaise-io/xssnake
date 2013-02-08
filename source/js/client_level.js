/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Level, Shape*/
'use strict';

/**
 * @param {number} levelID
 * @extends {Level}
 * @constructor
 */
function ClientLevel(levelID) {
    this.level = XSS.levels[levelID];
    this.level.walls = this.decompress(this.level.walls);
    this.level.unreachables = this.decompress(this.level.unreachables);
}

ClientLevel.prototype = Object.create(Level.prototype);

/** @lends {ClientLevel.prototype} */
XSS.util.extend(ClientLevel.prototype, {

    /**
     * @return {Shape}
     */
    getShape: function() {
        var pixels = [], shape, walls = this.level.walls;

        for (var i = 0, m = walls.length; i < m; i++) {
            pixels.push(this.seqToXY(walls[i]));
        }

        shape = new Shape(XSS.transform.zoomGame(pixels));
        shape.add(XSS.shapegen.outerBorder().pixels);
        shape.add(XSS.shapegen.innerBorder().pixels);

        return shape;
    }

});