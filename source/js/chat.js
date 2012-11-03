/*jshint globalstrict:true*/
/*globals XSS, Shape, Utils, InputField*/
'use strict';

/** @typedef {{author:?string,body:string}} */
var ChatMessage;

/**
 * @param {string} name
 * @param {Array.<ChatMessage>=} messages
 * @constructor
 */
function Chat(name, messages) {
    /** @type {Array.<ChatMessage>} */
    this.messages = messages || [{body: 'Press Tab to chat'}];
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
    message: function(message) {
        this.messages = this.messages.slice(-2);
        this.messages.push(message);
        this._updateShapes();
        return this;
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

    _chatFocus: function(e) {
        switch (e.which) {
            case XSS.KEY_TAB:
                this._focusInput(true);
                e.preventDefault();
                break;
            case XSS.KEY_ESCAPE:
                this._focusInput(false);
                e.preventDefault();
                break;
            case XSS.KEY_ENTER:
                if (this._chatHasFocus) {
                    if (this.field && this.field.value.trim()) {
                        this.send(this.field.value);
                        this.message({
                            author: this.name,
                            body: this.field.value
                        });
                    }
                    this._focusInput(false);
                } else {
                    this._focusInput(true);
                }
                e.preventDefault();
                break;
        }
    },

    _focusInput: function(focus) {
        var prefix = this.name + ': ';
        this._chatHasFocus = focus;
        this._updateShapes();
        if (focus) {
            this.field = new InputField(126, XSS.PIXELS_V - 9, prefix);
        } else if (this.field) {
            this.field.destruct();
            delete this.field;
        }
    },

    /**
     * @private
     */
    _updateShapes: function() {
        this.shapes = this._getShapes(this.messages.slice());
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