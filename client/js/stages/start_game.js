'use strict';

/**
 * @extends {xss.GameStage}
 * @implements {xss.StageInterface}
 * @constructor
 */
xss.StartGameStage = function() {
    xss.GameStage.call(this);
};

xss.util.extend(xss.StartGameStage.prototype, xss.GameStage.prototype);
