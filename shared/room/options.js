'use strict';

/**
 * @constructor
 */
xss.room.Options = function() {
    this.isQuickGame = false;
    this.maxPlayers  = 6;
    this.levelset    = 0;
    this.hasPowerups = true;
    this.isPrivate   = false;
    this.isXSS       = false;
};

xss.room.Options.prototype = {

    destruct: xss.util.noop,

    /**
     * @return {Array.<number>}
     */
    serialize: function() {
        return [
            this.maxPlayers,
            this.levelset,
            Number(this.isQuickGame),
            Number(this.hasPowerups),
            Number(this.isPrivate),
            Number(this.isXSS)
        ];
    },

    /**
     * @param {?} serialized
     */
    deserialize: function(serialized) {
        this.maxPlayers = new xss.util.Sanitizer(serialized[0])
            .assertBetween(1, xss.ROOM_CAPACITY)
            .getValueOr(xss.ROOM_CAPACITY);

        this.levelset = new xss.util.Sanitizer(serialized[1])
            .assertBetween(0, xss.levelsetRegistry.levelsets.length - 1)
            .getValueOr(0);

        this.isQuickGame = Boolean(serialized[2]);
        this.hasPowerups = Boolean(serialized[3]);
        this.isPrivate   = Boolean(serialized[4]);
        this.isXSS       = Boolean(serialized[5]);
    }

};
