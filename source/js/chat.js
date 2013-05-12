/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, InputField*/
'use strict';

/** @typedef {{
    author: (string|undefined),
    body: string}}
*/
XSS.ChatMessage = null;

/**
 * @param {number} index
 * @param {Array.<string>} names
 * @constructor
 */
function Chat(index, names) {

    this.index = index;
    this.names = names;

    /**
     * @type {Array.<XSS.ChatMessage>}
     * @private
     */
    this._messages = [
        {body: 'Press ' + XSS.UC_ENTER_KEY + ' to chat'}
    ];

    this._chatFocusBound = this._chatFocus.bind(this);
    this._hasFocus = false;

    this.shapes = {};

    this._adding = false;
    this._queue = [];

    this._bindEvents();
    this._updateShapes();
}

Chat.prototype = {

    top: XSS.HEIGHT - (7 * 3) - 3,

    left: 126,

    maxMessages: 3,

    animDuration: 200,

    destruct: function() {
        var events = XSS.events;
        XSS.pubsub.off(events.CHAT_MESSAGE);
        XSS.pubsub.off(events.CHAT_NOTICE);
        XSS.off.keydown(this._chatFocusBound);
        this._deleteShapes();
        if (this.field) {
            this.field.destruct();
        }
    },

    /**
     * @param {XSS.ChatMessage} message
     * @return {Chat}
     */
    add: function(message) {
        var anim, callback;

        if (this._adding) {
            this._queue.push(message);
            if (this._queue.length > 3) {
                this._messages = this._queue.slice(-3);
                this._updateShapes();
                this._queue = [];
            }
            return this;
        }

        this._adding = true;

        callback = function() {
            this._messages.push(message);
            this._adding = false;
            this._updateShapes();
            if (this._queue.length) {
                this.add(this._queue.shift());
            }
        }.bind(this);

        // Space left, just pop it in
        if (this._messages.length < this.maxMessages) {
            callback();
        }

        // Animation
        else {
            anim = {to: [0, -7], duration: this.animDuration, callback: callback};
            this.shapes['CM0'] = null;
            XSS.shapes['CM0'] = null;
            for (var k in this.shapes) {
                if (this.shapes.hasOwnProperty(k) && XSS.shapes[k]) {
                    XSS.shapes[k].animate(anim);
                }
            }
        }

        return this;
    },


    send: function(str) {
        XSS.socket.emit(XSS.events.CHAT_MESSAGE, str);
    },

    _bindEvents: function() {
        var events = XSS.events, pubsub = XSS.pubsub, ns = XSS.NS_GAME;
        pubsub.on(events.CHAT_MESSAGE, ns, this._chatMessage.bind(this));
        pubsub.on(events.CHAT_NOTICE, ns, this._chatNotice.bind(this));
        XSS.on.keydown(this._chatFocusBound);
    },

    /**
     * @param {Array} data
     */
    _chatMessage: function(data) {
        this.add({author: data[0], body: data[1]});
    },

    /**
     * @param {string} notice
     */
    _chatNotice: function(notice) {
        this.add({body: notice});
    },

    _updateShapes: function() {
        this.shapes = this._getShapes(this._messages);
    },

    /**
     * @param {Event} e
     * @private
     */
    _chatFocus: function(e) {
        switch (e.keyCode) {
            case XSS.KEY_ESCAPE:
                this._focusInput(false);
                e.preventDefault();
                break;
            case XSS.KEY_ENTER:
                e.preventDefault();
                if (this._hasFocus) {
                    this._sendMessage(this.field.value.trim());
                    this._focusInput(false);
                } else if (!XSS.keysBlocked) {
                    this._focusInput(true);
                }
                break;
        }
    },

    /**
     * @param {boolean} focus
     * @private
     */
    _focusInput: function(focus) {
        var left = 126, prefix, maxValWidth;
        prefix = this.names[this.index] + ': ';
        maxValWidth = XSS.WIDTH - XSS.font.width(prefix) - left - 8;
        this._hasFocus = focus;
        this._updateShapes();
        if (focus) {
            this.field = new InputField(left, XSS.HEIGHT - 10, prefix);
            this.field.maxValWidth = maxValWidth;
            this.field.setValue('');
        } else if (this.field) {
            this.field.destruct();
            delete this.field;
        }
    },

    /**
     * @param {string} value
     * @private
     */
    _sendMessage: function(value) {
        if (value) {
            this.send(value);
            this._messages.push({
                author: this.index,
                body  : value
            });
            this._updateShapes();
            this._sentIndication();
        }
    },

    _sentIndication: function() {
        var shape = XSS.font.shape(XSS.UC_ENTER_KEY, XSS.WIDTH - 8, XSS.HEIGHT - 10);
        shape.flash(150, 150).lifetime(0, 150 * 3);
        XSS.shapes.msgsent = shape;
    },

    _deleteShapes: function() {
        for (var k in this.shapes) {
            if (this.shapes.hasOwnProperty(k)) {
                XSS.shapes[k] = null;
            }
        }
    },

    _getMessageShape: function(index, message) {
        var messageStr, left = this.left, top = this.top + (index * 7);
        if (typeof message.author !== 'undefined') {
            messageStr = this.names[message.author] + ': ' + message.body;
        } else {
            for (var i = 0, m = this.names.length; i < m; i++) {
                var re = new RegExp('\\{' + i + '\\}', 'g');
                message.body = message.body.replace(re, this.names[i]);
            }
            messageStr = '>' + message.body;
            left -= XSS.font.width('>');
        }
        return XSS.font.shape(messageStr, left, top);
    },

    /**
     * @param messages
     * @private
     */
    _getShapes: function(messages) {
        var shapes = {}, slice = this.maxMessages;

        if (this._hasFocus) {
            slice -= 1;
            this._deleteShapes();
        }

        messages = messages.slice(-slice);

        for (var i = 0, m = messages.length; i < m; i++) {
            shapes['CM' + i] = this._getMessageShape(i, messages[i]);
        }

        XSS.util.extend(XSS.shapes, shapes);
        return shapes;
    }

};
