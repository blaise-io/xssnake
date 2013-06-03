/*jshint globalstrict:true, es5:true, expr:true, sub:true*/
/*globals XSS, CONST, Dialog, Room, Shape, Socket*/
'use strict';

/**
 * Game Stage
 * @implements {StageInterface}
 * @constructor
 */
function GameStage() {}

GameStage.prototype = {

    getShape: function() {
        return new Shape();
    },

    construct: function() {
        this._destructMenu();
        this._joinGame();
        this._bindKeys();

        XSS.room = new Room();
    },

    destruct: function() {
        XSS.event.off(CONST.EVENT_KEYDOWN, CONST.NS_STAGES);
    },

    _bindKeys: function() {
        XSS.event.on(CONST.EVENT_KEYDOWN, CONST.NS_STAGES, this._exitKeys.bind(this));
    },

    _exitKeys: function(e) {
        if (!XSS.keysBlocked && e.keyCode === CONST.KEY_ESCAPE && XSS.room) {
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
        if (XSS.flow.data.autoJoin) {
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
            [key, XSS.flow.data.name]
        );
    },

    _matchRoom: function() {
        var emit, data = XSS.flow.data;

        emit = {}; // data.gameprefs;
        emit[CONST.FIELD_NAME] = data.name;

        XSS.socket = new Socket(function() {
            XSS.socket.emit(CONST.EVENT_ROOM_MATCH, emit);
        });
    }

};
