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
        var message = this.clean(jsonStr);
        if (message) {
            this.isClean = true;
            this.event = message.event;
            this.data = message.data;
        }
    },

    clean: function(jsonStr) {
        var validator, json;

        validator = new xss.util.Validator(jsonStr)
            .assertStringOfLength(5, 512)
            .assertJSON();
        if (!validator.valid()) {
            return null;
        }

        json = validator.json();
        validator = new xss.util.Validator(json).assertArrayOfLength(1, 2);
        if (!validator.valid()) {
            return null;
        }

        validator = new xss.util.Validator(json[0]).assertStringOfLength(1, 20);
        if (!validator.valid()) {
            return null;
        }

        return {
            event: validator.value(),
            data: json[1] // Any type/structure allowed, validate in event listener.
        };
    }

};
