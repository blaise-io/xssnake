'use strict';

/**
 * Game Stage
 * @implements {xss.StageInterface}
 * @constructor
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
        this.connectServer();
    },

    destruct: function() {
        if (xss.player) {
            if (xss.player.room) {
                xss.player.room.destruct();
            }
            xss.player.destruct();
        }
        xss.event.off(xss.DOM_EVENT_KEYDOWN, xss.NS_STAGES);
        xss.shapes.CONNECTING = null;
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

    connectServer: function() {
        xss.shapes.CONNECTING = this.getConnectingShape();
        xss.player = new xss.room.ClientSocketPlayer(this.connectRoom.bind(this));
    },

    connectRoom: function(){
        xss.player.room = new xss.room.ClientRoom();
        xss.player.room.setupComponents();
        xss.player.emit(xss.NC_PLAYER_NAME, [this.getPlayerName()]);
        xss.player.emit(xss.NC_ROOM_JOIN_MATCHING, this.getEmitData());
        this.destructStageLeftovers();
    },

    getConnectingShape: function() {
        var shape = xss.font.shape(xss.COPY_CONNECTING);
        shape.center(xss.WIDTH, xss.HEIGHT - 20);
        shape.lifetime(2000);
        shape.flash();
        return shape;
    },

    destructStageLeftovers: function() {
        if (xss.menuSnake) {
            xss.menuSnake.destruct();
        }
        xss.shapes.CONNECTING = null;
        xss.shapes.HEADER = null;
    }

};
