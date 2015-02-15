'use strict';

/**
 * @param {xss.levelset.Config} config
 * @extends {xss.level.Level}
 * @constructor
 */
xss.levels.RotatingLinesLevel = function(config) {
    config.level = xss.data.levels.lines;
    xss.level.Level.call(this, config);
};

xss.extend(xss.levels.RotatingLinesLevel.prototype, xss.level.Level.prototype);
xss.extend(xss.levels.RotatingLinesLevel.prototype,
/** @lends {xss.levels.RotatingLinesLevel.prototype} */ {

    registerAnimations: function() {
        this.animations.register(
            new xss.levelanims.RotatingLine(31, 16, 12)
        );
    }

});
