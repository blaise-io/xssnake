'use strict';

/**
 * @extends {xss.stage.Game}
 * @implements {xss.StageInterface}
 * @constructor
 */
xss.stage.QuickGame = function() {
    xss.stage.Game.call(this);
};

xss.extend(xss.stage.QuickGame.prototype, xss.stage.Game.prototype);
xss.extend(xss.stage.QuickGame.prototype, /** @lends {xss.stage.QuickGame.prototype} */ {

    getSerializedGameOptions: function() {
        var options = new xss.room.ClientOptions();
        options.isQuickGame = true;
        return options.serialize();
    }

});
