'use strict';

/**
 * @param {string} jsonStr
 * @constructor
 */
xss.netcode.Message = function(jsonStr) {
    this.isClean = null;
    this.event = null;
    this.data = null;
    this.process(jsonStr);
};

xss.netcode.Message.prototype = {

    process: function(jsonStr) {
        var message = this.sanitize(jsonStr);
        if (message) {
            this.isClean = true;
            this.event = message.event;
            this.data = message.data;
        }
    },

    sanitize: function(messageJsonStr) {
        var sanitizer, arrayValidator, eventNumberValidator, messageJson;

        sanitizer = new xss.util.Sanitizer(messageJsonStr)
            .assertStringOfLength(3, 512)
            .assertJSON();
        if (!sanitizer.valid()) {
            return null;
        }

        messageJson = sanitizer.json();
        arrayValidator = new xss.util.Sanitizer(messageJson)
            .assertArrayLengthBetween(1, 20);
        if (!arrayValidator.valid()) {
            return null;
        }

        eventNumberValidator = new xss.util.Sanitizer(messageJson[0])
            .assertType('number');
        if (!eventNumberValidator.valid()) {
            return null;
        }

        // Maybe we should validate whether the message only contains
        // numbers, strings and arrays.

        return {
            event: eventNumberValidator.getValueOr(-1),
            data: messageJson.slice(1) // Validate in event listener.
        };
    }

};
