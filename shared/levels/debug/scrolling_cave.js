'use strict';

/**
 * @param {xss.levelset.Config} config
 * @extends {xss.level.Level}
 * @constructor
 */
xss.levels.ScrollingCaveLevel = function(config) {
    config.gravity = [-5, 0];
    config.level = xss.data.levels.blank;
    xss.level.Level.call(this, config);
};

xss.extend(xss.levels.ScrollingCaveLevel.prototype, xss.level.Level.prototype);
xss.extend(xss.levels.ScrollingCaveLevel.prototype,
/** @lends {xss.levels.RotatingLinesLevel.prototype} */ {

    registerAnimations: function() {
        this.animations.register(
            new xss.levelanims.ScrollingCave(+new Date())
        );
    }

});
