'use strict';

/**
 * @param {number=} created Time server created the room. Required by Level
 *                          to sync client-server animations. Not required
 *                          for offline play.
 * @constructor
 * @deprecated
 */
xss.ClientGameModel = function(created) {
    /**
     * @deprecated
     */
    this.offsetDelta = created ? this.getOffsetDelta(created) : 0;
    /**
     * @deprecated
     */
    this.started = false;
};

xss.ClientGameModel.prototype = {
    /**
     * @deprecated
     */
    getOffsetDelta: function(created) {
        var serverCreatedAsLocal = xss.socket.model.toLocalTime(created);
        return new Date() - serverCreatedAsLocal;
    }

};
