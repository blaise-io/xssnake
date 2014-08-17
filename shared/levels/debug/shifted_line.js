'use strict';

/**
 * @param {xss.levelset.Config} config
 * @extends {xss.level.Level}
 * @constructor
 */
xss.levels.ShiftedLineLevel = function(config) {
    config.gravity = [-5, 0];
    config.level = xss.data.levels.blank;
    xss.level.Level.call(this, config);
};

xss.util.extend(xss.levels.ShiftedLineLevel.prototype, xss.level.Level.prototype);
xss.util.extend(xss.levels.ShiftedLineLevel.prototype, {

    registerAnimations: function() {
        this.animations.register(
            new xss.levelanims.ShiftedLine(5, 5, 5, 10, 0, 10)
        );
    }

});
