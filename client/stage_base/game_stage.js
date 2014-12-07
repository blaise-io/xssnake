'use strict';

/**
 * Game Stage
 * @implements {xss.StageInterface}
 * @constructor
 * @todo Split connecting and inside game
 */
xss.stage.Game = function() {};

xss.stage.Game.prototype = {

    getShape: function() {
        return new xss.Shape();
    },

    getData: function() {
        return {};
    },

    construct: function() {
        this.destructMenu();
        this.connectToRoom();
    },

    destruct: function() {
        if (xss.player) {
            if (xss.player.room) {
                xss.player.room.destruct();
            }
            xss.player.destruct();
        }
        xss.event.off(xss.DOM_EVENT_KEYDOWN, xss.NS_STAGES);
    },

    destructMenu: function() {
        if (xss.menuSnake) {
            xss.menuSnake.destruct();
        }
        xss.shapes.header = null;
    },

    getSerializedGameOptions: function() {
        var options, data = xss.flow.getData();
        options = new xss.room.ClientOptions();
        options.setOptionsFromForm(data.multiplayer);
        return options.serialize();
    },

    getPlayerName: function() {
        var name = xss.util.storage(xss.STORAGE_NAME);
        if (!name) {
            name = xss.util.getRandomName();
            xss.util.storage(name, xss.STORAGE_NAME);
        }
        return name;
    },

    getEmitData: function() {
        return this.getSerializedGameOptions();
    },

    connectToRoom: function() {
        xss.player = new xss.room.ClientSocketPlayer(function() {
            xss.player.room = new xss.room.ClientRoom();
            xss.player.room.propagateToPlayer();
            xss.player.emit(xss.NC_PLAYER_NAME, [this.getPlayerName()]);
            xss.player.emit(xss.NC_ROOM_JOIN_MATCHING, this.getEmitData());
        }.bind(this));
    }

};
