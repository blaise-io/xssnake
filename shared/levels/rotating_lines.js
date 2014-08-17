'use strict';

/**
 * @param {xss.levelset.Config} config
 * @extends {xss.level.Level}
 * @constructor
 */
xss.levels.RotatingLinesLevel = function(config) {
    config.level = xss.data.levels.lines;
    xss.level.Level.call(this, config);
    this.registerAnimations();
};

xss.util.extend(xss.levels.RotatingLinesLevel.prototype, xss.level.Level.prototype);
xss.util.extend(xss.levels.RotatingLinesLevel.prototype, {

    registerAnimations: function() {
        this.animations.register(
            new xss.levelanim.RotatingLine(31, 16, 12)
        );
    }

});
