'use strict';

/**
 * @extends {xss.stage.Game}
 * @implements {xss.StageInterface}
 * @constructor
 */
xss.StartGameStage = function() {
    xss.stage.Game.call(this);
};

xss.extend(xss.StartGameStage.prototype, xss.stage.Game.prototype);
