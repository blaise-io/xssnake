'use strict';

/**
 * Game Stage
 * @implements {xss.StageInterface}
 * @constructor
 * @todo Split connecting and inside game
 */
xss.stage.Game = function() {
    /** @type {xss.room.ClientRoom} */
    this.room = null;
    //this.data = xss.flow.getData();
};

xss.stage.Game.prototype = {

    getShape: function() {
        return new xss.Shape();
    },

    getData: function() {
        return {};
    },

    construct: function() {
        this.destructMenu();
        this.bindKeys();
        this.connectToRoom();
    },

    destruct: function() {
        if (this.room) {
            this.room.destruct();
            this.room = null;
        }
        xss.event.off(xss.DOM_EVENT_KEYDOWN, xss.NS_STAGES);
    },

    bindKeys: function() {
        xss.event.on(xss.DOM_EVENT_KEYDOWN, xss.NS_STAGES, this.exitKeys.bind(this));
    },

    exitKeys: function(ev) {
        //if (!xss.keysBlocked && ev.keyCode === xss.KEY_ESCAPE && xss.remoteRoom) {
        //    this.dialog = new xss.Dialog(
        //        'LEAVING GAME',
        //        'Are you sure you want to leave this game?', {
        //            ok: function() {
        //                xss.flow.restart();
        //            }
        //        }
        //    );
        //}
    },

    destructMenu: function() {
        if (xss.menuSnake) {
            xss.menuSnake.destruct();
        }
        xss.shapes.header = null;
    },

    getSerializedGameOptions: function(name) {
        var options, data = xss.flow.getData();
        options = new xss.room.ClientOptions(name);
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
        return this.getSerializedGameOptions(this.getPlayerName());
    },

    connectToRoom: function() {
        xss.player = new xss.room.ClientSocketPlayer(function() {
            this.room = new xss.room.ClientRoom();
            xss.player.emit(xss.EVENT_PLAYER_NAME, this.getPlayerName());
            xss.player.emit(xss.EVENT_ROOM_JOIN_MATCHING, this.getEmitData());
        }.bind(this));
    }

    //joinGame: function() {
    //    xss.remoteRoom = new xss.room.ClientRoom();
    //    if (this.data.autoJoin) {
    //        this._autoJoin(xss.util.hash(xss.HASH_ROOM));
    //    } else {
    //        this._matchRoom();
    //    }
    //}

    //
    //_autoJoin: function(key) {
    //    xss.event.once(xss.EVENT_ROOM_STATUS, xss.NS_STAGES, function(data) {
    //        if (!data[0]) {
    //            xss.util.error(xss.room.ClientRoom.prototype.errorCodeToStr(data[1]));
    //        }
    //    });
    //
    //    xss.socket.emit(
    //        xss.EVENT_ROOM_JOIN_KEY,
    //        [key, this.data.name]
    //    );
    //},
    //
    //_getQuickGameData: function() {
    //    var data = {};
    //    data[xss.FIELD_QUICK_GAME] = true;
    //    // Used for creating a new game if all public rooms were full.
    //    data[xss.FIELD_LEVEL_SET] = xss.levelSetRegistry.getRandomIndex();
    //    data[xss.FIELD_POWERUPS] = true;
    //    data[xss.FIELD_PRIVATE] = false;
    //    data[xss.FIELD_XSS] = false;
    //    data[xss.FIELD_MAX_PLAYERS] = 6;
    //    return data;
    //},
    //
    //
    //_matchRoom: function() {
    //    var emit = this.data.multiplayer || this._getQuickGameData();
    //    emit[xss.FIELD_QUICK_GAME] = !!emit[xss.FIELD_QUICK_GAME];
    //    emit[xss.FIELD_NAME] = (
    //        xss.util.storage(xss.STORAGE_NAME) ||
    //        this._getRandomName()
    //    );
    //    xss.socket = new xss.room.ClientSocketPlayer(function() {
    //        xss.socket.emit(xss.EVENT_ROOM_JOIN_MATCHING, emit);
    //    });
    //}

};
