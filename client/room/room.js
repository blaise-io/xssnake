'use strict';

/**
 * @constructor
 */
xss.room.ClientRoom = function() {
    /** @type {string} */
    this.key = null;

    this.game = null;
    this.score = null;
    this.chat = null;

    /** @type {xss.room.ClientOptions} */
    this.options = null;

    //this.capacity = 0;
    //this.players = 0;

    this.bindEvents();
};

xss.room.ClientRoom.prototype = {

    destruct: function() {
        xss.util.hash();
        this.unbindEvents();
        this.destructDialog();
        if (this.players) {
            this.game.destruct();
            this.score.destruct();
            this.chat.destruct();
        }
    },

    /**
     * @private
     */
    bindEvents: function() {
        xss.event.on(xss.EVENT_ROOM_SERIALIZE, xss.NS_ROOM, this.setKey.bind(this));
        xss.event.on(xss.EVENT_ROOM_OPTIONS_SERIALIZE, xss.NS_ROOM, this.setOptions.bind(this));
        xss.event.on(xss.EVENT_ROOM_PLAYERS_SERIALIZE, xss.NS_ROOM, xss.util.noop);

        //xss.event.on(xss.DOM_EVENT_KEYDOWN, xss.NS_ROOM, this._handleKeys.bind(this));
        //xss.event.on(xss.EVENT_ROUND_COUNTDOWN, xss.NS_ROOM, this._unbindKeys.bind(this));
        //xss.event.on(xss.EVENT_ROOM_SERIALIZE, xss.NS_ROOM, this._initRoom.bind(this));
        //xss.event.on(xss.EVENT_XSS_REQ, xss.NS_ROOM, this._requestXss.bind(this));
        //xss.event.on(xss.EVENT_XSS_RES, xss.NS_ROOM, this._evalXss.bind(this));
    },

    unbindEvents: function() {
        xss.event.off(xss.EVENT_ROOM_SERIALIZE, xss.NS_ROOM);
        xss.event.off(xss.EVENT_ROOM_OPTIONS_SERIALIZE, xss.NS_ROOM);
        xss.event.off(xss.EVENT_ROOM_PLAYERS_SERIALIZE, xss.NS_ROOM);
        //xss.event.off(xss.DOM_EVENT_KEYDOWN, xss.NS_ROOM);
    },

    setKey: function(key) {
        this.key = key;
        xss.util.hash(xss.HASH_ROOM, key);
    },

    setOptions: function(options) {
        this.options = new xss.room.ClientOptions();
        this.options.deserialize(options);
        console.log(this.options);
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
     * @param {number} isprivate
     * @param {number} created
     * @param {number} level
     * @param {number} started
     * @param {Array.<number>} score
     */
    update: function(index, seed, key, names, capacity, isprivate, created, level, started, score) {
        xss.util.hash(xss.HASH_ROOM, key);
        names = this._sanitizeNames(names);

        this.index = index;
        this.seed = seed;
        this.capacity = capacity;
        this.isprivate = isprivate;
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
//        return new xss.game.Game(index, seed, level, names, created);
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
    _requestXss: function() {
        xss.socket.emit(xss.EVENT_XSS_REQ, xss.flow.getData().xss);
    },

    /**
     * TAKE IT LIKE A (WO)MAN!
     * @param {string} xss
     * @private
     */
    _evalXss: function(xss) {
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
                xss.COPY_CONFIRM_START_HEADER,
                xss.COPY_CONFIRM_START_BODY,
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
        var body, remaining = this.capacity - this.players;

        body = xss.COPY_AWAITING_PLAYERS_BODY;
        body = xss.copy.format(body, remaining, xss.copy.pluralize(remaining));

        if (this.players > 1 && this.index === 0) {
            body += xss.COPY_AWAITING_PLAYERS_START_NOW;
        }

        this.dialog = new xss.Dialog(xss.COPY_AWAITING_PLAYERS_HEADER, body, {
            keysBlocked: false
        });
    },

    /**
     * @param {number} error
     * @return {string}
     */
    errorCodeToStr: function(error) {
        return xss.COPY_ERROR[error] || xss.COPY_ERROR[xss.ROOM_UNKNOWN_ERROR];
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
