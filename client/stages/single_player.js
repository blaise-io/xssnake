'use strict';

/**
 * @constructor
 * @implements {xss.StageInterface}
 * @extends {xss.stage.Game}
 */
xss.stage.SinglePlayer = function() {
    xss.stage.Game.call(this);
};

xss.extend(xss.stage.SinglePlayer.prototype, xss.stage.Game.prototype);
xss.extend(xss.stage.SinglePlayer.prototype, /** @lends {xss.stage.SinglePlayer.prototype} */ {

    getSerializedGameOptions: function() {
        var options = new xss.room.ClientOptions();
        options.maxPlayers = 1;
        options.isPrivate = true;
        return options.serialize();
    }

});
