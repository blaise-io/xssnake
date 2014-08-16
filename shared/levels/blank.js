'use strict';

/**
 * @param {xss.levelset.Levelset} levelset
 * @extends {xss.level.Level}
 * @constructor
 */
xss.levels.BlankLevel = function(levelset) {
    xss.level.Level.apply(this, arguments);
    this.image = xss.data.levels.blank;
};

xss.util.extend(xss.levels.BlankLevel.prototype, xss.level.Level.prototype);
