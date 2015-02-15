'use strict';

/**
 * @param {xss.levelset.Config} config
 * @extends {xss.level.Level}
 * @constructor
 */
xss.levels.BlankLevel = function(config) {
    config.level = xss.data.levels.blank;
    xss.level.Level.call(this, config);
};

xss.extend(xss.levels.BlankLevel.prototype, xss.level.Level.prototype);
