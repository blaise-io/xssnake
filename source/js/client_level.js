/*jshint globalstrict:true, sub:true*/
/*globals XSS, Level, PixelEntity*/
'use strict';


/**
 * @param {number} levelID
 * @extends {Level}
 * @constructor
 */
function ClientLevel(levelID) {
    this.levelID = levelID;
    this.level = XSS.levels[levelID];
}

ClientLevel.prototype = Object.create(Level.prototype);

// Cannot use Object.create to extend properties using an object, see
// http://code.google.com/p/closure-compiler/issues/detail?id=455

/**
 * @return {PixelEntity}
 * @this {ClientLevel}
 */
ClientLevel.prototype.getEntity = function() {
    var xy, pixels = [], walls = this.level.walls;
    for (var i = 0, m = walls.length; i < m; i++) {
        xy = this.seqToXY(walls[i]);
        pixels.push(xy);
    }
    return new PixelEntity(XSS.transform.zoomGame(pixels));
};