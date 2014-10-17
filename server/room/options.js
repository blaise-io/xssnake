'use strict';

/**
 * @param {?} dirtyOptions
 * @constructor
 */
xss.room.Options = function(dirtyOptions) {
    this.setCleanOptions(dirtyOptions);
};

xss.room.Options.prototype = {

    /**
     * @param {?} dirty
     */
    setCleanOptions: function(dirty) {
        var Validator = xss.util.Validator;

        this.maxPlayers = new Validator(dirty[1])
            .assertRange(1, xss.ROOM_CAPACITY)
            .value(xss.ROOM_CAPACITY);

        this.levelSet = new Validator(dirty[2])
            .assertRange(0, xss.levelSetRegistry.levelsets.length - 1)
            .value(xss.FIELD_VALUE_MEDIUM);

        this.isQuickGame = Boolean(dirty[3]);
        this.hasPowerups = Boolean(dirty[4]);
        this.isPrivate   = Boolean(dirty[5]);
        this.isXSS       = Boolean(dirty[6]);
    },

    serialize: function() {
        return [
            this.maxPlayers,
            this.levelSet,
            Number(this.isQuickGame),
            Number(this.hasPowerups),
            Number(this.isPrivate),
            Number(this.isXSS)
        ];
    },

    /**
     * @param {xss.room.Options} request
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

};
