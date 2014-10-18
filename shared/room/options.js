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

    serialize: function() {
        return [
            this.maxPlayers,
            this.levelSet,
            Number(this.isQuickGame),
            Number(this.hasPowerups),
            Number(this.isPrivate),
            Number(this.isXSS)
        ];
    }

};
