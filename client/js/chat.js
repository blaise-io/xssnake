'use strict';

/** @typedef {{
    author: (string|undefined),
    body: string}}
*/
xss.ChatMessage;

/**
 * @param {number} index
 * @param {Array.<string>} names
 * @constructor
 */
xss.Chat = function(index, names) {

    this.index = index;
    this.names = names;
    this.shapes = {};

    /**
     * @type {Array.<xss.ChatMessage>}
     * @private
     */
    this._messages = [
        {body: 'Press ' + xss.UC_ENTER_KEY + ' to chat'}
    ];

    this._hasFocus = false;
    this._adding = false;
    this._queue = [];

    this.top = xss.HEIGHT - (7 * 3) - 3;
    this.left = 126;

    this._bindEvents();
    this._updateShapes();
};

xss.Chat.prototype = {

    maxMessages: 3,

    animDuration: 200,

    destruct: function() {
        xss.event.off(xss.EVENT_CHAT_MESSAGE, xss.NS_CHAT);
        xss.event.off(xss.EVENT_CHAT_NOTICE, xss.NS_CHAT);
        xss.event.off(xss.EVENT_KEYDOWN, xss.NS_CHAT);

        this._deleteShapes();

        if (this.input) {
            this.input.destruct();
        }
    },

    /**
     * @param {xss.ChatMessage} message
     * @return {xss.Chat}
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
            this.shapes[xss.NS_CHAT + 0] = null;
            xss.shapes[xss.NS_CHAT + 0] = null; // TODO: Can I remove this?
            for (var k in this.shapes) {
                if (this.shapes.hasOwnProperty(k) && xss.shapes[k]) {
                    xss.shapes[k].animate(anim);
                }
            }
        }

        return this;
    },

    send: function(str) {
        xss.socket.emit(xss.EVENT_CHAT_MESSAGE, str);
    },

    _bindEvents: function() {
        var ns = xss.NS_CHAT;
        xss.event.on(xss.EVENT_CHAT_MESSAGE, ns, this._chatMessage.bind(this));
        xss.event.on(xss.EVENT_CHAT_NOTICE, ns, this._chatNotice.bind(this));
        xss.event.on(xss.EVENT_KEYDOWN, ns, this._chatFocus.bind(this));
    },

    /**
     * @param {Array} data
     */
    _chatMessage: function(data) {
        this.add({author: data[0], body: data[1]});
    },

    /**
     * @param {Array} notice
     */
    _chatNotice: function(notice) {
        var body = this._notice.format(notice);
        this.add({body: body});
    },

    _updateShapes: function() {
        this.shapes = this._getShapes(this._messages);
    },

    /**
     * @param {Event} ev
     * @private
     */
    _chatFocus: function(ev) {
        switch (ev.keyCode) {
            case xss.KEY_ESCAPE:
                this._focusInput(false);
                ev.preventDefault();
                break;
            case xss.KEY_ENTER:
                ev.preventDefault();
                if (this._hasFocus) {
                    this._sendMessage(this.input.getValue());
                    this._focusInput(false);
                } else if (!xss.keysBlocked) {
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
        maxValWidth = xss.WIDTH - xss.font.width(prefix) - left - 8;
        this._hasFocus = focus;
        this._updateShapes();
        if (focus) {
            this.input = new xss.InputField(left, xss.HEIGHT - 10, prefix);
            this.input.maxValWidth = maxValWidth;
            this.input.setValue('');
        } else if (this.input) {
            this.input.destruct();
            delete this.input;
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
        var shape, x = xss.WIDTH - xss.font.width(xss.UC_ENTER_KEY) - 2;
        shape = xss.font.shape(xss.UC_ENTER_KEY, x, xss.HEIGHT - 10);
        shape.flash(150, 150).lifetime(0, 150 * 3);
        xss.shapes.msgsent = shape;
    },

    _deleteShapes: function() {
        for (var k in this.shapes) {
            if (this.shapes.hasOwnProperty(k)) {
                xss.shapes[k] = null;
                this.shapes[k] = null;
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
            left -= xss.font.width('>');
        }
        return xss.font.shape(messageStr, left, top);
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
            shapes[xss.NS_CHAT + i] = this._getMessageShape(i, messages[i]);
        }

        xss.util.extend(xss.shapes, shapes);
        return shapes;
    }

};
