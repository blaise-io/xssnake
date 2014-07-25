'use strict';

/**
 * Game Stage
 * @implements {xss.StageInterface}
 * @constructor
 */
xss.GameStage = function() {
    this.data = xss.flow.getData();
};

xss.GameStage.prototype = {

    getShape: function() {
        return new xss.Shape();
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
        xss.event.off(xss.EVENT_KEYDOWN, xss.NS_STAGES);
    },

    _bindKeys: function() {
        xss.event.on(xss.EVENT_KEYDOWN, xss.NS_STAGES, this._exitKeys.bind(this));
    },

    _exitKeys: function(ev) {
        if (!xss.keysBlocked && ev.keyCode === xss.KEY_ESCAPE && xss.room) {
            this.dialog = new xss.Dialog(
                'LEAVING GAME',
                'Are you sure you want to leave this game?', {
                    ok: function() {
                        xss.flow.restart();
                    }
                }
            );
        }
    },

    _destructMenu: function() {
        if (xss.menuSnake) {
            xss.menuSnake.destruct();
        }
        xss.shapes.header = null;
    },

    _joinGame: function() {
        xss.room = new xss.Room();
        if (this.data.autoJoin) {
            this._autoJoin(xss.util.hash(xss.HASH_ROOM));
        } else {
            this._matchRoom();
        }
    },

    _autoJoin: function(key) {
        xss.event.once(xss.EVENT_ROOM_STATUS, xss.NS_STAGES, function(data) {
            if (!data[0]) {
                xss.util.error(xss.Room.prototype.errorCodeToStr(data[1]));
            }
        });

        xss.socket.emit(
            xss.EVENT_ROOM_JOIN,
            [key, this.data.name]
        );
    },

    _getQuickGameData: function() {
        var data = {};
        data[xss.FIELD_QUICK_GAME] = true;
        // Used for creating a new game if all public rooms were full.
        data[xss.FIELD_DIFFICULTY] = xss.FIELD_VALUE_MEDIUM;
        data[xss.FIELD_POWERUPS] = true;
        data[xss.FIELD_PRIVATE] = false;
        data[xss.FIELD_XSS] = false;
        data[xss.FIELD_MAX_PLAYERS] = 6;
        return data;
    },

    _matchRoom: function() {
        var emit = this.data.multiplayer || this._getQuickGameData();
        emit[xss.FIELD_QUICK_GAME] = !!emit[xss.FIELD_QUICK_GAME];
        emit[xss.FIELD_NAME] = (
            xss.util.storage(xss.STORAGE_NAME) ||
            'Player_' + xss.util.randomStr(3)
        );
        xss.socket = new xss.Socket(function() {
            xss.socket.emit(xss.EVENT_ROOM_MATCH, emit);
        });
    }

};
