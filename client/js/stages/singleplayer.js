'use strict';

/**
 * @constructor
 * @implements {xss.StageInterface}
 * @extends {xss.GameStage}
 */
xss.SingleplayerStage = function() {
    var multiplayer = {};

    multiplayer[xss.FIELD_DIFFICULTY] = xss.FIELD_VALUE_HARD;
    multiplayer[xss.FIELD_POWERUPS] = true;
    multiplayer[xss.FIELD_PRIVATE] = true;
    multiplayer[xss.FIELD_XSS] = false;
    multiplayer[xss.FIELD_MAX_PLAYERS] = 1;

    xss.GameStage.call(this);

    this.data.multiplayer = multiplayer;
    this.data.name = xss.util.storage(xss.STORAGE_NAME) || '???';
};

xss.util.extend(xss.SingleplayerStage.prototype, xss.GameStage.prototype);
