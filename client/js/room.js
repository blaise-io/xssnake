'use strict';

/**
 * @constructor
 */
xss.Room = function() {
    this.game = null;
    this.score = null;
    this.chat = null;

    this.capacity = 0;
    this.players = 0;

    this._bindEvents();
};

xss.Room.prototype = {

    destruct: function() {
        xss.event.off(xss.EVENT_ROOM_SERIALIZE, xss.NS_ROOM);
        xss.event.off(xss.EVENT_XSS_REQ, xss.NS_ROOM);
        xss.event.off(xss.EVENT_XSS_RES, xss.NS_ROOM);
        xss.util.hash();
        this.unbindKeys();
        this.destructDialog();
        if (this.players) {
            this.game.destruct();
            this.score.destruct();
            this.chat.destruct();
        }
    },

    unbindKeys: function() {
        xss.event.off(xss.EVENT_KEYDOWN, xss.NS_ROOM);
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
     * @param {number} seed
     * @param {string} key
     * @param {Array.<string>} names
     * @param {number} capacity
     * @param {number} created
     * @param {number} level
     * @param {number} started
     * @param {Array.<number>} score
     */
    update: function(index, seed, key, names, capacity, created, level, started, score) {
        xss.util.hash(xss.HASH_ROOM, key);
        names = this._sanitizeNames(names);

        this.index = index;
        this.seed = seed;
        this.capacity = capacity;
        this.players = names.length;

        this.game  = this._updateGame(index, seed, level, names, created);
        this.score = this._updateScore(names, score);
        this.chat  = this._updateChat(index, names);

        if (!started) {
            this._updateAwaitingMessage();
        }
    },

    _updateGame: function(index, seed, level, names, created) {
        if (this.game) {
            this.game.destruct();
        }
        return new xss.Game(index, seed, level, names, created);
    },

    _updateScore: function(names, score) {
        if (this.score) {
            this.score.destruct();
        }
        return new xss.ScoreBoard(names, score);
    },

    _updateChat: function(index, names) {
        var chat = this.chat;
        if (chat) {
            chat.index = index;
            chat.names = names;
            return chat;
        } else {
            return new xss.Chat(index, names);
        }
    },

    /**
     * @private
     */
    _bindEvents: function() {
        xss.event.on(xss.EVENT_KEYDOWN, xss.NS_ROOM, this._handleKeys.bind(this));
        xss.event.on(xss.EVENT_ROOM_SERIALIZE, xss.NS_ROOM, this._initRoom.bind(this));
        xss.event.on(xss.EVENT_XSS_REQ, xss.NS_ROOM, this._reqxss.bind(this));
        xss.event.on(xss.EVENT_XSS_RES, xss.NS_ROOM, this._evalxss.bind(this));
    },

    /**
     * @private
     */
    _reqxss: function() {
        xss.socket.emit(xss.EVENT_XSS_REQ, xss.flow.getData().xss);
    },

    /**
     * TAKE IT LIKE A (WO)MAN!
     * @param {string} xss
     * @private
     */
    _evalxss: function(xss) {
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
        if (!xss.keysBlocked) {
            switch (ev.keyCode) {
                case xss.KEY_ESCAPE:
                    this._handleExitKey();
                    break;
                case xss.KEY_START:
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
            type  : xss.Dialog.TYPE.CONFIRM,
            ok    : this._leaveRoom.bind(this),
            cancel: this._restoreDialog.bind(this)
        };
        this.dialog.destruct();
        this.dialog2 = new xss.Dialog(
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
            type  : xss.Dialog.TYPE.CONFIRM,
            ok    : function() { xss.socket.emit(xss.EVENT_ROOM_START); },
            cancel: this._restoreDialog.bind(this)
        };

        if (this.index === 0 && this.players > 1) {
            this.dialog.destruct();
            this.dialog2 = new xss.Dialog(
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
        xss.flow.restart();
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

        this.dialog = new xss.Dialog(header, body, {
            keysBlocked: false
        });
    },

    /**
     * @param {number} error
     * @return {string}
     */
    errorCodeToStr: function(error) {
        switch (error) {
            case xss.ROOM_INVALID:
                return 'INVALID ROOM KEY';
            case xss.ROOM_NOT_FOUND:
                return 'ROOM NOT FOUND';
            case xss.ROOM_FULL:
                return 'LE ROOM IS FULL!';
            case xss.ROOM_IN_PROGRESS:
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
            while (xss.font.width(names[i]) > xss.UI_WIDTH_NAME) {
                names[i] = names[i].slice(0, -1);
            }
        }
        return names;
    }

};
