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

xss.extend(xss.room.ServerOptions.prototype, xss.room.Options.prototype);
xss.extend(xss.room.ServerOptions.prototype, /** @lends {xss.room.ServerOptions.prototype} */ {

    /**
     * @param {xss.room.ServerPlayer} player
     */
    emit: function(player) {
        player.emit(xss.NC_OPTIONS_SERIALIZE, this.serialize());
    },

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
