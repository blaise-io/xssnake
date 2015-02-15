'use strict';

/**
 * @param {string|null|undefined=} author
 * @param {string=} body
 * @constructor
 */
xss.room.Message = function(author, body) {
    this.author = author;
    this.body = body;
    this.notificationPrefix = '#';
};

xss.room.Message.prototype = {

    getFormatted: function() {
        if (this.author === null) {
            return this.notificationPrefix + this.body;
        } else {
            return this.author + ': ' + this.body;
        }
    },

    getOffset: function() {
        return this.author === null ? 0 : xss.font.width(this.notificationPrefix);
    }

};
