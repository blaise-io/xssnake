/*jshint globalstrict:true, es5:true, expr:true, sub:true*/
/*globals XSS, CONST, Dialog, Room, Shape, Socket*/
'use strict';

/**
 * Game Stage
 * @implements {StageInterface}
 * @constructor
 */
function GameStage() {
    this.data = XSS.flow.getData();
}

GameStage.prototype = {

    getShape: function() {
        return new Shape();
    },

    getData: function() {
        return {};
    },

    construct: function() {
        this._destructMenu();
        this._joinGame();
        this._bindKeys();
    },

    destruct: function() {
        XSS.event.off(CONST.EVENT_KEYDOWN, CONST.NS_STAGES);
    },

    _bindKeys: function() {
        XSS.event.on(CONST.EVENT_KEYDOWN, CONST.NS_STAGES, this._exitKeys.bind(this));
    },

    _exitKeys: function(ev) {
        if (!XSS.keysBlocked && ev.keyCode === CONST.KEY_ESCAPE && XSS.room) {
            this.dialog = new Dialog(
                'LEAVING GAME',
                'Are you sure you want to leave this game?', {
                    ok: function() {
                        XSS.flow.restart();
                    }
                }
            );
        }
    },

    _destructMenu: function() {
        if (XSS.menuSnake) {
            XSS.menuSnake.destruct();
        }
        XSS.shapes.header = null;
    },

    _joinGame: function() {
        XSS.room = new Room();
        if (this.data.autoJoin) {
            this._autoJoin(XSS.util.hash(CONST.HASH_ROOM));
        } else {
            this._matchRoom();
        }
    },

    _autoJoin: function(key) {
        XSS.event.once(CONST.EVENT_ROOM_STATUS, CONST.NS_STAGES, function(data) {
            if (!data[0]) {
                XSS.util.error(Room.prototype.errorCodeToStr(data[1]));
            }
        });

        XSS.socket.emit(
            CONST.EVENT_ROOM_JOIN,
            [key, this.data.name]
        );
    },

    _matchRoom: function() {
        var emit = this.data.multiplayer;
        emit[CONST.FIELD_NAME] = this.data.name;

        XSS.socket = new Socket(function() {
            XSS.socket.emit(CONST.EVENT_ROOM_MATCH, emit);
        });
    }

};
