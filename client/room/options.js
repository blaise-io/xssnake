'use strict';

/**
 * @constructor
 */
xss.room.ClientOptions = function(name) {
    this.name        = name;
    this.isQuickGame = false;
    this.maxPlayers  = 6;
    this.levelSet    = xss.levelSetRegistry.getRandomIndex();
    this.hasPowerups = true;
    this.isPrivate   = false;
    this.isXSS       = false;
};

xss.room.ClientOptions.prototype = {

    setOptionsFromForm: function(indexedOptions) {
        this.isQuickGame = indexedOptions[xss.FIELD_QUICK_GAME];
        this.maxPlayers  = indexedOptions[xss.FIELD_MAX_PLAYERS];
        this.levelSet    = indexedOptions[xss.FIELD_LEVEL_SET];
        this.hasPowerups = indexedOptions[xss.FIELD_POWERUPS];
        this.isPrivate   = indexedOptions[xss.FIELD_PRIVATE];
        this.isXSS       = indexedOptions[xss.FIELD_XSS];
    },

    serialize: function() {
        return [
            this.name,
            this.maxPlayers,
            this.levelSet,
            Number(this.isQuickGame),
            Number(this.hasPowerups),
            Number(this.isPrivate),
            Number(this.isXSS)
        ];
    }

};
