'use strict';

/**
 * @constructor
 * @implements {xss.StageInterface}
 * @extends {xss.stage.Game}
 */
xss.SingleplayerStage = function() {
    var multiplayer = {};

    multiplayer[xss.FIELD_LEVEL_SET] = 0;
    multiplayer[xss.FIELD_POWERUPS] = true;
    multiplayer[xss.FIELD_PRIVATE] = true;
    multiplayer[xss.FIELD_XSS] = false;
    multiplayer[xss.FIELD_MAX_PLAYERS] = 1;

    xss.stage.Game.call(this);

    this.data.multiplayer = multiplayer;
    this.data.name = xss.util.storage(xss.STORAGE_NAME) || '???';
};

xss.util.extend(xss.SingleplayerStage.prototype, xss.stage.Game.prototype);
