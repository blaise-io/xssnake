/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Game, Chat, Dialog, ScoreBoard*/
'use strict';

/**
 * @param {number} index
 * @param {number} capacity
 * @param {number} round
 * @param {string} key
 * @param {number} level
 * @param {Array.<string>} names
 * @param {Array.<number>} score
 * @constructor
 */
function Room(index, capacity, round, key, level, names, score) {
    this.game = null;
    this.score = null;
    this.chat = null;
    this.capacity = 0;
    this.round = 0;

    this.update.apply(this, arguments);
}

Room.prototype = {

    destruct: function() {
        this.unbindKeys();
        this.game.destruct();
        this.score.destruct();
        this.chat.destruct();
    },

    bindKeys: function() {
        this._bindKeysBound = this._bindKeys.bind(this);
        if (this.localIsHost) {
            XSS.on.keydown(this._bindKeysBound);
        }
    },

    unbindKeys: function() {
        XSS.off.keydown(this._bindKeysBound);
    },

    _bindKeys: function(e) {
        if (!XSS.keysBlocked && this.players > 1 && e.keyCode === XSS.KEY_START) {
            this.dialog.destruct();
            this.dialog = new Dialog(
                'ROOM NOT FULL',
                'Are you sure you want to start the game already?', {
                    type  : Dialog.TYPE.CONFIRM,
                    ok    : function() {
                        XSS.socket.emit(XSS.events.SERVER_ROOM_START);
                    },
                    cancel: this.updateAwaitingMessage.bind(this)
                }
            );
        }
    },

    /**
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
        this.localIsHost = (index === 0);

        if (this.chat) {
            this.chat.index = index;
            this.chat.names = names;
        } else {
            this.chat = new Chat(index, names);
        }

        if (round === 0) {
            this.updateAwaitingMessage();
        }

        this.unbindKeys();
        this.bindKeys();
    },

    updateAwaitingMessage: function() {
        var header, body, remaining = this.capacity - this.players;
        header = 'NEED ' + remaining + ' MORE PLAYER%s...';
        header = header.replace('%s', remaining !== 1 ? 'S' : '');
        body = 'Invite people to this room by sharing the page URL.';
        if (this.players > 1 && this.localIsHost) {
            body += '\nOr press S to start now.';
        }

        this.dialog = new Dialog(header, body, {
            blockKeys: false
        });
    },

    /**
     * @param {number} error
     * @returns {string}
     */
    errorCodeToStr: function(error) {
        switch (error) {
            case XSS.map.ROOM.NOT_FOUND:
                return 'ROOM NOT FOUND';
            case XSS.map.ROOM.FULL:
                return 'LE ROOM IS FULL!';
            case XSS.map.ROOM.IN_PROGRESS:
                return 'GAME IN PROGRESS';
            default:
                return 'UNKNOWN ERROR OHSHI';
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
