'use strict';

/**
 * @param {xss.levelset.Config} config
 * @extends {xss.level.Level}
 * @constructor
 */
xss.levels.LinesLevel = function(config) {
    config.level = xss.data.levels.lines;
    xss.level.Level.call(this, config);
};

xss.extend(xss.levels.LinesLevel.prototype, xss.level.Level.prototype);
