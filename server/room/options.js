'use strict';

/**
 * @param {?} rawOptions
 * @constructor
 */
xss.room.Options = function(rawOptions) {
    this.setCleanOptions(rawOptions);
};

xss.room.Options.prototype = {

    /**
     * @param {?} dirty
     */
    setCleanOptions: function(dirty) {
        var Validator = xss.util.Validator;

        this.maxPlayers = new Validator(dirty[xss.FIELD_MAX_PLAYERS])
            .assertRange(1, xss.ROOM_CAPACITY)
            .value(xss.ROOM_CAPACITY);

        this.levelSet = new Validator(dirty[xss.FIELD_LEVEL_SET])
            .assertRange(0, xss.levelSetRegistry.levelsets.length - 1)
            .value(xss.FIELD_VALUE_MEDIUM);

        this.hasPowerups = new Validator(dirty[xss.FIELD_POWERUPS])
            .assertType('boolean')
            .value(true);

        this.isPrivate = new Validator(dirty[xss.FIELD_PRIVATE])
            .assertType('boolean')
            .value(false);

        this.isXSS = new Validator(dirty[xss.FIELD_XSS])
            .assertType('boolean')
            .value(false);

        this.isQuickGame = new Validator(dirty[xss.FIELD_QUICK_GAME])
            .assertType('boolean')
            .value(false);
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
