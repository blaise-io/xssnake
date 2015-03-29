'use strict';

/**
 * @extends {xss.stage.Game}
 * @implements {xss.StageInterface}
 * @constructor
 */
xss.stage.QuickJoinGame = function() {
    xss.stage.Game.call(this);
};

xss.extend(xss.stage.QuickJoinGame.prototype, xss.stage.Game.prototype);
xss.extend(xss.stage.QuickJoinGame.prototype, /** @lends {xss.stage.QuickJoinGame.prototype} */ {

    connectServer: function() {
        xss.player.room.setupComponents();
        xss.player.emit(xss.NC_PLAYER_NAME, [this.getPlayerName()]);
        xss.player.emit(xss.NC_ROOM_JOIN_KEY, [xss.player.room.key]);
        this.bindEvents();
    },

    bindEvents: function() {
        xss.event.on(
            xss.NC_PLAYERS_SERIALIZE,
            xss.NS_STAGES,
            this.setupRoom.bind(this)
        );

        xss.event.on(
            xss.NC_ROOM_JOIN_ERROR,
            xss.NS_STAGES,
            this.handleError.bind(this)
        );
    },

    unbindEvents: function() {
        xss.event.off(xss.NC_PLAYERS_SERIALIZE, xss.NS_STAGES);
        xss.event.off(xss.NC_ROOM_JOIN_ERROR, xss.NS_STAGES);
    },

    setupRoom: function() {
        this.destructStageLeftovers();
        this.unbindEvents();
    },

    handleError: function(data) {
        this.unbindEvents();
        xss.util.error(xss.COPY_ERROR[data[0]]);
        xss.player = null;
    }

});
