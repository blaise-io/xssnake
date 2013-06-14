/*jshint globalstrict:true, es5:true, expr:true, sub:true*/
/*globals XSS, CONST, Game, Chat, Dialog, ScoreBoard*/
'use strict';

/**
 * @constructor
 */
function Room() {
    this.game = null;
    this.score = null;
    this.chat = null;

    this.capacity = 0;
    this.players = 0;

    this._bindEvents();
}

Room.prototype = {

    destruct: function() {
        XSS.event.off(CONST.EVENT_ROOM_INDEX, CONST.NS_ROOM);
        XSS.util.hash();
        this.unbindKeys();
        this.destructDialog();
        if (this.players) {
            this.game.destruct();
            this.score.destruct();
            this.chat.destruct();
        }
    },

    unbindKeys: function() {
        XSS.event.off(CONST.EVENT_KEYDOWN, CONST.NS_ROOM);
    },

    destructDialog: function() {
        if (this.dialog) {
            this.dialog.destruct();
            this.dialog = null;
        }
        if (this.dialog2) {
            this.dialog2.destruct();
        }
    },

    /**
     * TODO: Split up in multiple functions
     * @param {number} index
     * @param {number} capacity
     * @param {number} started
     * @param {string} key
     * @param {number} level
     * @param {Array.<string>} names
     * @param {Array.<number>} score
     */
    update: function(index, capacity, started, key, level, names, score) {
        names = this._sanitizeNames(names);

        this.score = new ScoreBoard(names, score);
        if (this.game) {
            this.game.destruct();
        }

        this.game = new Game(index, level, names);

        XSS.util.hash(CONST.HASH_ROOM, key);

        this.index = index;
        this.capacity = capacity;
        this.players = names.length;

        if (this.chat) {
            this.chat.index = index;
            this.chat.names = names;
        } else {
            this.chat = new Chat(index, names);
        }

        if (!started) {
            this._updateAwaitingMessage();
        }
    },

    /**
     * @private
     */
    _bindEvents: function() {
        XSS.event.on(CONST.EVENT_KEYDOWN, CONST.NS_ROOM, this._handleKeys.bind(this));
        XSS.event.on(CONST.EVENT_ROOM_INDEX, CONST.NS_ROOM, this._initRoom.bind(this));
    },

    /**
     * @param {Array} data
     */
    _initRoom: function(data) {
        this.update.apply(this, data);
    },

    /**
     * @private
     */
    _handleKeys: function(ev) {
        if (!XSS.keysBlocked) {
            switch (ev.keyCode) {
                case CONST.KEY_ESCAPE:
                    this._handleExitKey();
                    break;
                case CONST.KEY_START:
                    this._handleStartKey();
                    break;
            }
        }
    },

    /**
     * @private
     */
    _handleExitKey: function() {
        var settings = {
            type  : Dialog.TYPE.CONFIRM,
            ok    : this._leaveRoom.bind(this),
            cancel: this._restoreDialog.bind(this)
        };
        this.dialog.destruct();
        this.dialog2 = new Dialog(
            'LEAVING ROOM',
            'Are you sure?',
            settings
        );
    },

    /**
     * @private
     */
    _handleStartKey: function() {
        var settings = {
            type  : Dialog.TYPE.CONFIRM,
            ok    : function() { XSS.socket.emit(CONST.EVENT_ROOM_START); },
            cancel: this._restoreDialog.bind(this)
        };
        
        if (this.index === 0 && this.players > 1) {
            this.dialog.destruct();
            this.dialog2 = new Dialog(
                'ROOM NOT FULL',
                'You could squeeze in more players. Are you sure you want ' +
                    'to start the game already?',
                settings
            );
        }
    },

    /**
     * @private
     */
    _leaveRoom: function() {
        this.destruct();
        XSS.flow.restart();
    },

    /**
     * @private
     */
    _restoreDialog: function() {
        if (this.dialog) {
            this.dialog.restore();
        }
    },

    /**
     * @private
     */
    _updateAwaitingMessage: function() {
        var header, body, remaining = this.capacity - this.players;
        header = 'NEED ' + remaining + ' MORE PLAYER%s...';
        header = header.replace('%s', remaining !== 1 ? 'S' : '');
        body = 'Share the current page URL with friends so they ' +
               'can join this room directly!';
        if (this.players > 1 && this.index === 0) {
            body += ' Or press S to start now.';
        }

        this.dialog = new Dialog(header, body, {
            keysBlocked: false
        });
    },

    /**
     * @param {number} error
     * @return {string}
     */
    errorCodeToStr: function(error) {
        switch (error) {
            case CONST.ROOM_INVALID:
                return 'INVALID ROOM KEY';
            case CONST.ROOM_NOT_FOUND:
                return 'ROOM NOT FOUND';
            case CONST.ROOM_FULL:
                return 'LE ROOM IS FULL!';
            case CONST.ROOM_IN_PROGRESS:
                return 'GAME IN PROGRESS';
            default:
                return 'UNKNOWN ERROROOSHIII';
        }
    },

    /**
     * @param {Array.<string>} names
     * @return {Array.<string>}
     * @private
     */
    _sanitizeNames: function(names) {
        for (var i = 0, m = names.length; i < m; i++) {
            while (XSS.font.width(names[i]) > CONST.UI_WIDTH_NAME) {
                names[i] = names[i].slice(0, -1);
            }
        }
        return names;
    }

};
