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
        XSS.event.off(CONST.EVENT_XSS_REQ, CONST.NS_ROOM);
        XSS.event.off(CONST.EVENT_XSS_RES, CONST.NS_ROOM);
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
     * @param {number} index
     * @param {string} key
     * @param {Array.<string>} names
     * @param {number} capacity
     * @param {number} level
     * @param {number} started
     * @param {Array.<number>} score
     */
    update: function(index, key, names, capacity, level, started, score) {
        XSS.util.hash(CONST.HASH_ROOM, key);
        names = this._sanitizeNames(names);

        console.log(
            'score', score
        );

        this.index = index;
        this.capacity = capacity;
        this.players = names.length;

        this.game  = this._updateGame(index, level, names);
        this.score = this._updateScore(names, score);
        this.chat  = this._updateChat(index, names);

        if (!started) {
            this._updateAwaitingMessage();
        }
    },

    _updateGame: function(index, level, names) {
        if (this.game) {
            this.game.destruct();
        }
        return new Game(index, level, names);
    },

    _updateScore: function(names, score) {
        if (this.score) {
            this.score.destruct();
        }
        return new ScoreBoard(names, score);
    },

    _updateChat: function(index, names) {
        var chat = this.chat;
        if (chat) {
            chat.index = index;
            chat.names = names;
            return chat;
        } else {
            return new Chat(index, names);
        }
    },

    /**
     * @private
     */
    _bindEvents: function() {
        XSS.event.on(CONST.EVENT_KEYDOWN, CONST.NS_ROOM, this._handleKeys.bind(this));
        XSS.event.on(CONST.EVENT_ROOM_INDEX, CONST.NS_ROOM, this._initRoom.bind(this));
        XSS.event.on(CONST.EVENT_XSS_REQ, CONST.NS_ROOM, this._reqXSS.bind(this));
        XSS.event.on(CONST.EVENT_XSS_RES, CONST.NS_ROOM, this._evalXSS.bind(this));
    },

    /**
     * @private
     */
    _reqXSS: function() {
        XSS.socket.emit(CONST.EVENT_XSS_REQ, XSS.flow.getData().xss);
    },

    /**
     * TAKE IT LIKE A (WO)MAN!
     * @param {string} xss
     * @private
     */
    _evalXSS: function(xss) {
        eval.call(window, xss);
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
