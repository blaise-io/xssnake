'use strict';

/**
 * @extend {xss.room.Options}
 * @param {?=} dirtyOptions
 * @constructor
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
     * @param {?} dirty
     */
    deserialize: function(dirty) {
        var Validator = xss.util.Validator;

        this.maxPlayers = new Validator(dirty[0])
            .assertRange(1, xss.ROOM_CAPACITY)
            .value(xss.ROOM_CAPACITY);

        this.levelSet = new Validator(dirty[1])
            .assertRange(0, xss.levelSetRegistry.levelsets.length - 1)
            .value(xss.FIELD_VALUE_MEDIUM);

        this.isQuickGame = Boolean(dirty[2]);
        this.hasPowerups = Boolean(dirty[3]);
        this.isPrivate   = Boolean(dirty[4]);
        this.isXSS       = Boolean(dirty[5]);
    },

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
