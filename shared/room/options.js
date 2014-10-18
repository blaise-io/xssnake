'use strict';

/**
 * @constructor
 */
xss.room.Options = function() {
    this.isQuickGame = false;
    this.maxPlayers  = 6;
    this.levelSet    = 0;
    this.hasPowerups = true;
    this.isPrivate   = false;
    this.isXSS       = false;
};

xss.room.Options.prototype = {

    /**
     * @returns {Array.<number>}
     */
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
     * @param {?} dirtyOptions
     */
    deserialize: function(dirtyOptions) {
        this.maxPlayers = new xss.util.Sanitizer(dirtyOptions[0])
            .assertRange(1, xss.ROOM_CAPACITY)
            .getValueOr(xss.ROOM_CAPACITY);

        this.levelSet = new xss.util.Sanitizer(dirtyOptions[1])
            .assertRange(0, xss.levelSetRegistry.levelsets.length - 1)
            .getValueOr(0);

        this.isQuickGame = Boolean(dirtyOptions[2]);
        this.hasPowerups = Boolean(dirtyOptions[3]);
        this.isPrivate   = Boolean(dirtyOptions[4]);
        this.isXSS       = Boolean(dirtyOptions[5]);
    }

};
