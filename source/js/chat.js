/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Util, InputField*/
'use strict';

/** @typedef {{author:?string,body:string}} */
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
        {body: 'Press ' + XSS.UNICODE_ENTER_KEY + ' to chat'}
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

    top: XSS.PIXELS_V - (7 * 3) - 3,

    left: 126,

    maxMessages: 3,

    animDuration: 200,

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
                if (this.shapes.hasOwnProperty(k)) {
                    XSS.shapes[k].animate(anim);
                }
            }
        }

        return this;
    },

    _updateShapes: function() {
        this.shapes = this._getShapes(this._messages);
    },

    destruct: function() {
        if (this.field) {
            this.field.destruct();
        }
        this._deleteShapes();
    },

    send: function(str) {
        XSS.socket.emit(XSS.events.SERVER_CHAT_MESSAGE, str);
    },

    _bindEvents: function() {
        XSS.on.keydown(this._chatFocusBound);
    },

    /**
     * @param {Event} e
     * @private
     */
    _chatFocus: function(e) {
        switch (e.which) {
            case XSS.KEY_ESCAPE:
                this._focusInput(false);
                e.preventDefault();
                break;
            case XSS.KEY_ENTER:
                if (this._hasFocus) {
                    this._sendMessage(this.field.value.trim());
                }
                this._focusInput(!this._hasFocus);
                e.preventDefault();
                break;
        }
    },

    /**
     * @param {boolean} focus
     * @private
     */
    _focusInput: function(focus) {
        var left = 126, prefix, maxWidth;
        prefix = this.names[this.index] + ': ';
        maxWidth = XSS.PIXELS_H - XSS.font.width(prefix) - left - 8;
        this._hasFocus = focus;
        this._updateShapes();
        if (focus) {
            this.field = new InputField(left, XSS.PIXELS_V - 10, prefix);
            this.field.maxWidth = maxWidth;
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
        var shape = XSS.font.shape(XSS.UNICODE_ENTER_KEY, XSS.PIXELS_H - 8, XSS.PIXELS_V - 9);
        shape.flash(XSS.FLASH_FAST).lifetime(0, XSS.FLASH_FAST * 3);
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

        Util.extend(XSS.shapes, shapes);
        return shapes;
    }

};