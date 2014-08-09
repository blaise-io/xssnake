'use strict';

/**
 * @type {xss.levelset.Base} levelset
 * @extends {xss.level.Base}
 * @constructor
 */
xss.level.BlankLevel = function(levelset) {
    xss.level.Base.apply(this, arguments);
    this.levelImage = xss.data.levels.blank;
};

xss.util.extend(xss.level.BlankLevel.prototype, xss.level.Base.prototype);
xss.util.extend(xss.level.BlankLevel.prototype, {

});
