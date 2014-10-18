'use strict';

/**
 * @param dirtyOptions
 * @constructor
 * @extends {xss.room.Options}
 */
xss.room.ServerOptions = function(dirtyOptions) {
    xss.room.Options.call(this);

    if (dirtyOptions) {
        this.deserialize(dirtyOptions);
    }
};

xss.util.extend(xss.room.ServerOptions.prototype, xss.room.Options.prototype);
xss.util.extend(xss.room.ServerOptions.prototype, {

    /**
     * @param {xss.room.ServerOptions} request
     * @returns {boolean}
     */
    matches: function(request) {
        return (
            !this.isPrivate &&
            !request.isPrivate &&
            request.isXSS === this.isXSS &&
            (request.isQuickGame || (
                request.levelSet === this.levelSet &&
                request.hasPowerups === this.hasPowerups &&
                request.maxPlayers <= this.maxPlayers
            ))
        );
    }

});
