'use strict';

/**
 * @param {xss.levelset.Config} config
 * @extends {xss.level.Level}
 * @constructor
 */
xss.levels.CrosshairLevel = function(config) {
    config.level = xss.data.levels.crosshair;
    xss.level.Level.call(this, config);
};

xss.extend(xss.levels.CrosshairLevel.prototype, xss.level.Level.prototype);
