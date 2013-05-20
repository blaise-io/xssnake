/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Game, Chat, Dialog, ScoreBoard*/
'use strict';

/**
 * @constructor
 */
function Room() {
    this.game = null;
    this.score = null;
    this.chat = null;

    this.capacity = 0;
    this.round = 0;
    this.players = 0;

    this._bindEvents();
}

Room.prototype = {

    destruct: function() {
        XSS.pubsub.off(XSS.events.ROOM_INDEX, XSS.NS_ROOM);
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
        XSS.off.keydown(this._bindKeysBound);
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
     * @param {number} round
     * @param {string} key
     * @param {number} level
     * @param {Array.<string>} names
     * @param {Array.<number>} score
     */
    update: function(index, capacity, round, key, level, names, score) {
        names = this._sanitizeNames(names);
        this.score = new ScoreBoard(names, score);
        if (this.game) {
            this.game.destruct();
        }

        this.game = new Game(index, level, names);

        XSS.util.hash(XSS.HASH_ROOM, key);

        this.index = index;
        this.capacity = capacity;
        this.players = names.length;

        if (this.chat) {
            this.chat.index = index;
            this.chat.names = names;
        } else {
            this.chat = new Chat(index, names);
        }

        if (round === 0) {
            this._updateAwaitingMessage();
        }
    },

    /**
     * @private
     */
    _bindEvents: function() {
        this._bindKeysBound = this._bindKeys.bind(this);
        XSS.on.keydown(this._bindKeysBound);

        var ns = XSS.NS_ROOM;
        XSS.pubsub.on(XSS.events.ROOM_INDEX, ns, this._initRoom.bind(this));
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
    _bindKeys: function(e) {
        if (XSS.keysBlocked) {
            return;
        }
        switch (e.keyCode) {
            case XSS.KEY_ESCAPE:
                this._handleExitKey();
                break;
            case XSS.KEY_START:
                this._handleStartKey();
                break;
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
            ok    : function() { XSS.socket.emit(XSS.events.ROOM_START); },
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
            case XSS.map.ROOM.INVALID:
                return 'INVALID ROOM KEY';
            case XSS.map.ROOM.NOT_FOUND:
                return 'ROOM NOT FOUND';
            case XSS.map.ROOM.FULL:
                return 'LE ROOM IS FULL!';
            case XSS.map.ROOM.IN_PROGRESS:
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
            while (XSS.font.width(names[i]) > XSS.UI_WIDTH_NAME) {
                names[i] = names[i].slice(0, -1);
            }
        }
        return names;
    }

};
