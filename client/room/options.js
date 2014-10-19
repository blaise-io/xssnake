'use strict';

/**
 * @constructor
 * @extends {xss.room.Options}
 */
xss.room.ClientOptions = function() {
    xss.room.Options.call(this);
    this.levelset = xss.levelSetRegistry.getRandomLevelsetIndex();
};

xss.util.extend(xss.room.ClientOptions.prototype, xss.room.Options.prototype);
xss.util.extend(xss.room.ClientOptions.prototype, {

    setOptionsFromForm: function(indexedOptions) {
        this.isQuickGame = false;
        this.maxPlayers  = indexedOptions[xss.FIELD_MAX_PLAYERS];
        this.levelset    = indexedOptions[xss.FIELD_LEVEL_SET];
        this.hasPowerups = indexedOptions[xss.FIELD_POWERUPS];
        this.isPrivate   = indexedOptions[xss.FIELD_PRIVATE];
        this.isXSS       = indexedOptions[xss.FIELD_XSS];
    }

});