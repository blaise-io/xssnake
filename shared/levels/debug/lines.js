'use strict';

/**
 * @param {xss.levelset.Config} config
 * @extends {xss.level.Level}
 * @constructor
 */
xss.levels.LinesLevel = function(config) {
    config.gravity = [-5, 0];
    config.level = xss.data.levels.lines;
    xss.level.Level.call(this, config);
};

xss.util.extend(xss.levels.LinesLevel.prototype, xss.level.Level.prototype);
