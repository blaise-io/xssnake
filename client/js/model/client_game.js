'use strict';

/**
 * @param {number} created
 * @constructor
 */
xss.model.ClientGame = function(created) {
    this.offsetDelta = this.getOffsetDelta(created);
    this.started = false;
};

xss.model.ClientGame.prototype = {

    getOffsetDelta: function(created) {
        var serverCreatedAsLocal = xss.socket.model.toLocalTime(created);
        return new Date() - serverCreatedAsLocal;
    }

};
