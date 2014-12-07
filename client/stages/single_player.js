'use strict';

/**
 * @constructor
 * @implements {xss.StageInterface}
 * @extends {xss.stage.Game}
 */
xss.stage.SinglePlayer = function() {
    xss.stage.Game.call(this);
};

xss.util.extend(xss.stage.SinglePlayer.prototype, xss.stage.Game.prototype);
xss.util.extend(xss.stage.SinglePlayer.prototype, {

    getSerializedGameOptions: function(name) {
        var options = new xss.room.ClientOptions(name);
        options.maxPlayers = 1;
        return options.serialize();
    }

});
