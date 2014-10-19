'use strict';

/**
 * @param {Array=} dirtyOptions
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
     * @return {boolean}
     */
    matches: function(request) {
        return (
            !this.isPrivate &&
            !request.isPrivate &&
            request.isXSS === this.isXSS &&
            (request.isQuickGame || (
                request.levelset === this.levelset &&
                request.hasPowerups === this.hasPowerups &&
                request.maxPlayers <= this.maxPlayers
            ))
        );
    }

});
