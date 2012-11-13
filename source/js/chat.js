/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Utils, InputField*/
'use strict';

/** @typedef {{author:?string,body:string}} */
var ChatMessage;

/**
 * @param {number} index
 * @param {Array.<string>} names
 * @constructor
 */
function Chat(index, names) {

    this.index = index;
    this.names = names;

    /**
     * @type {Array.<ChatMessage>}
     * @private
     */
    this._messages = [{body: 'Press Enter key to chat'}];

    XSS.bound.chatFocus = this._chatFocus.bind(this);
    this._hasFocus = false;

    this.shapes = {};

    this.top = XSS.PIXELS_V - (7 * 3) - 2;
    this.left = 126;
    this.max = 3;
    this.animSpeed = 100;

    this._bindEvents();
    this._updateShapes();
}

Chat.prototype = {

    /**
     * @param {ChatMessage} message
     * @return {Chat}
     */
    add: function(message) {
        var anim, callback;

        if (this._adding) {
            this._messages.push(message);
            return this;
        }

        this._adding = true;

        callback = function() {
            this._messages.push(message);
            this._updateShapes();
            this._adding = false;
        }.bind(this);

        // Space left, just pop it in
        if (this._messages.length < this.max) {
            callback();
        }

        // Animation
        else {
            anim = {to: [0, -7], duration: this.animSpeed, callback: callback};
            delete this.shapes['CM0'];
            delete XSS.shapes['CM0'];
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
        XSS.on.keydown(XSS.bound.chatFocus);
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
                    this._focusInput(false);
                } else {
                    this._focusInput(true);
                }
                e.preventDefault();
                break;
        }
    },

    /**
     * @param {boolean} focus
     * @private
     */
    _focusInput: function(focus) {
        var left = 126,
            prefix = this.names[this.index] + ': ',
            maxWidth = XSS.PIXELS_H - XSS.font.width(prefix) - left - 8;
        this._hasFocus = focus;
        this._updateShapes();
        if (focus) {
            this.field = new InputField(left, XSS.PIXELS_V - 9, prefix, maxWidth);
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
        var shape = XSS.font.shape(XSS.PIXELS_H - 8, XSS.PIXELS_V - 9, '↵');
        shape.flash(XSS.FLASH_FAST).lifetime(0, XSS.FLASH_FAST * 3, true);
        XSS.shapes.msgsent = shape;
    },

    _deleteShapes: function() {
        for (var k in this.shapes) {
            if (this.shapes.hasOwnProperty(k)) {
                delete XSS.shapes[k];
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
            messageStr = '[' + message.body + ']';
            left -= XSS.font.width('[') + 1;
        }
        return XSS.font.shape(left, top, messageStr);
    },

    /**
     * @param messages
     * @private
     */
    _getShapes: function(messages) {
        var shapes = {}, slice = this.max;

        if (this._hasFocus) {
            slice -= 1;
            this._deleteShapes();
        }

        messages = messages.slice(-slice);

        for (var i = 0, m = messages.length; i < m; i++) {
            shapes['CM' + i] = this._getMessageShape(i, messages[i]);
        }

        Utils.extend(XSS.shapes, shapes);
        return shapes;
    }

};