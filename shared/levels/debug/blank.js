'use strict';

/**
 * @param {xss.levelset.Config} config
 * @extends {xss.level.Level}
 * @constructor
 */
xss.levels.BlankLevel = function(config) {
    config.gravity = [-5, 0];
    config.level = xss.data.levels.lines;
    xss.level.Level.call(this, config);
};

xss.util.extend(xss.levels.BlankLevel.prototype, xss.level.Level.prototype);
