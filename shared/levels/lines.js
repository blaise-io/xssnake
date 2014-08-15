'use strict';

/**
 * @param {xss.levelset.Levelset} levelset
 * @extends {xss.level.Level}
 * @constructor
 */
xss.level.LinesLevel = function(levelset) {
    xss.level.Level.apply(this, arguments);
    this.image = xss.data.levels.lines;
};

xss.util.extend(xss.level.LinesLevel.prototype, xss.level.Level.prototype);
