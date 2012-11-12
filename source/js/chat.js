/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Utils, InputField*/
'use strict';

/** @typedef {{author:?string,body:string}} */
var ChatMessage;

/**
 * @param {string} name
 * @param {Array.<ChatMessage>=} messages
 * @constructor
 */
function Chat(name, messages) {

    /**
     * @type {Array.<ChatMessage>}
     * @private
     */
    this._messages = messages || [{body: 'Press Enter key to chat'}];
    this.name = name;

    XSS.bound.chatFocus = this._chatFocus.bind(this);
    this._chatHasFocus = false;
    this.shapes = {};

    this._bindEvents();
    this._updateShapes();
}

Chat.prototype = {

    /**
     * @param {ChatMessage} message
     * @return {Chat}
     */
    add: function(message) {
        this._messages = this._messages.slice(-2);
        this._messages.push(message);
        this._updateShapes();
        return this;
    },

    _updateShapes: function() {
        this.shapes = this._getShapes(this._messages.slice());
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
                if (this._chatHasFocus) {
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
            prefix = this.name + ': ',
            maxWidth = XSS.PIXELS_H - XSS.font.width(prefix) - left - 8;
        this._chatHasFocus = focus;
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
        var shape;
        if (value) {
            this.send(value);
            this.add({
                author: this.name,
                body  : value
            });
            shape = XSS.font.shape(XSS.PIXELS_H - 8, XSS.PIXELS_V - 9, '↵');
            shape.flash(XSS.FLASH_FAST).lifetime(0, XSS.FLASH_FAST * 3, true);
            XSS.shapes.msgsent = shape;
        }
    },

    _deleteShapes: function() {
        for (var k in this.shapes) {
            if (this.shapes.hasOwnProperty(k)) {
                delete XSS.shapes[k];
            }
        }
    },

    /**
     * @param messages
     * @private
     */
    _getShapes: function(messages) {
        var shapes = {}, left = 126, max = 3, show = messages.length;
        if (this._chatHasFocus) {
            this._deleteShapes();
            show = Math.min(show + 1, max);
            messages = messages.slice(-max + 1);
        }
        for (var i = 0, m = messages.length; i < m; i++) {
            var top, shape, leftmp = left, message = messages[i].author;
            top = XSS.PIXELS_V - 2 - (show - i) * 7;
            if (message) {
                message += ': ' + messages[i].body;
            } else {
                message = '[' + messages[i].body + ']';
                leftmp -= XSS.font.width('[') + 1;
            }
            shape = XSS.font.shape(leftmp, top, message);
            shapes['CH' + i] = shape;
        }
        Utils.extend(XSS.shapes, shapes);
        return shapes;
    }

};