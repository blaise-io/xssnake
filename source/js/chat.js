/*jshint globalstrict:true*/
/*globals XSS, Shape, Utils*/
'use strict';

/** @typedef {{author:?string,body:string}} */
var ChatMessage;

/**
 * @param {Array.<ChatMessage>=} messages
 * @constructor
 */
function Chat(messages) {
    /** @type {Array.<ChatMessage>} */
    this.messages = messages || [{body: 'Press Tab to chat'}];
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

    _bindEvents: function() {
        // TODO: on tab key = show caret, hide last line of chat
        // TODO: on enter = submit
        // TODO: on tab = unfocus
        // TODO make messages persistent for a room
        XSS.socket.emit(XSS.events.SERVER_CHAT_MESSAGE, 'Hello!');
    },

    /**
     * @private
     */
    _addShapes: function() {
        Utils.extend(XSS.shapes, this.shapes);
    },

    /**
     * @private
     */
    _updateShapes: function() {
        this.shapes = this._generateShapes(this.messages);
        this._addShapes();
    },

    /**
     * @param messages
     * @return {Object.<string,Shape>}
     * @private
     */
    _generateShapes: function(messages) {
        var top, shapes = {}, left = 126;
        top = XSS.PIXELS_V - 2 - messages.length * 7;
        for (var i = 0, m = messages.length; i < m; i++) {
            var shape, leftmp = left, message = messages[i].author;
            if (message) {
                message += ': ' + messages[i].body;
            } else {
                message = '[' + messages[i].body + ']';
                leftmp -= XSS.font.width('[') + 1;
            }
            shape = XSS.font.shape(leftmp, top, message);
            shapes['CH' + i] = shape;
            top += 7;
        }
        return shapes;
    }

};