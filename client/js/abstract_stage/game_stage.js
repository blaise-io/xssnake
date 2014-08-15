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
        xss.event.off(xss.DOM_EVENT_KEYDOWN, xss.NS_STAGES);
    },

    _bindKeys: function() {
        xss.event.on(xss.DOM_EVENT_KEYDOWN, xss.NS_STAGES, this._exitKeys.bind(this));
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
        xss.room = new xss.room.Room();
        if (this.data.autoJoin) {
            this._autoJoin(xss.util.hash(xss.HASH_ROOM));
        } else {
            this._matchRoom();
        }
    },

    _autoJoin: function(key) {
        xss.event.once(xss.EVENT_ROOM_STATUS, xss.NS_STAGES, function(data) {
            if (!data[0]) {
                xss.util.error(xss.room.Room.prototype.errorCodeToStr(data[1]));
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
        data[xss.FIELD_LEVEL_SET] = xss.levelSetRegistry.getRandomIndex();
        data[xss.FIELD_POWERUPS] = true;
        data[xss.FIELD_PRIVATE] = false;
        data[xss.FIELD_XSS] = false;
        data[xss.FIELD_MAX_PLAYERS] = 6;
        return data;
    },

    _getRandomName: function() {
        var name = xss.util.randomItem([
            'Ant', 'Bat', 'Bear', 'Bird', 'Cat', 'Cow', 'Crab', 'Croc', 'Deer',
            'Dodo', 'Dog', 'Duck', 'Emu', 'Fish', 'Fly', 'Fox', 'Frog', 'Goat',
            'Hare', 'Ibis', 'Kiwi', 'Lion', 'Lynx', 'Mole', 'Moth', 'Mule',
            'Olm', 'Pig', 'Pika', 'Poke', 'Puma', 'Puss', 'Rat', 'Seal', 'Swan',
            'Wasp', 'Wolf', 'Yak'
        ]);
        return name + '.' + xss.util.randomRange(10, 99);
    },

    _matchRoom: function() {
        var emit = this.data.multiplayer || this._getQuickGameData();
        emit[xss.FIELD_QUICK_GAME] = !!emit[xss.FIELD_QUICK_GAME];
        emit[xss.FIELD_NAME] = (
            xss.util.storage(xss.STORAGE_NAME) ||
            this._getRandomName()
        );
        xss.socket = new xss.Socket(function() {
            xss.socket.emit(xss.EVENT_ROOM_MATCH, emit);
        });
    }

};
