'use strict';

/**
 * @extend {xss.room.Options}
 * @constructor
 */
xss.room.ClientOptions = function() {
    xss.room.Options.call(this);
    this.levelSet = xss.levelSetRegistry.getRandomIndex();
};

xss.util.extend(xss.room.ClientOptions.prototype, xss.room.Options.prototype);
xss.util.extend(xss.room.ClientOptions.prototype, {

    setOptionsFromForm: function(indexedOptions) {
        this.isQuickGame = indexedOptions[xss.FIELD_QUICK_GAME];
        this.maxPlayers  = indexedOptions[xss.FIELD_MAX_PLAYERS];
        this.levelSet    = indexedOptions[xss.FIELD_LEVEL_SET];
        this.hasPowerups = indexedOptions[xss.FIELD_POWERUPS];
        this.isPrivate   = indexedOptions[xss.FIELD_PRIVATE];
        this.isXSS       = indexedOptions[xss.FIELD_XSS];
    }

});
