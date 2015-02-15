'use strict';

/**
 * @param {xss.levelset.Config} config
 * @extends {xss.level.Level}
 * @constructor
 */
xss.levels.ShiftedLineLevel = function(config) {
    config.level = xss.data.levels.blank;
    xss.level.Level.call(this, config);
};

xss.extend(xss.levels.ShiftedLineLevel.prototype, xss.level.Level.prototype);
xss.extend(xss.levels.ShiftedLineLevel.prototype,
/** @lends {xss.levels.RotatingLinesLevel.prototype} */ {

    registerAnimations: function() {
        this.animations.register(
            // x0, y0, x1, y1, sx, sy
            new xss.levelanims.ShiftedLine(0,0, 10,10, 4,4)
        );
    }

});
