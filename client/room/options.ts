/**
 * @constructor
 * @extends {room.Options}
 */
export class ClientOptions {
    constructor(ClientOptions) {
    room.Options.call(this);
    this.levelset = State.levelsetRegistry.getRandomLevelsetIndex();
};

extend(room.ClientOptions.prototype, room.Options.prototype);
extend(room.ClientOptions.prototype, /** @lends {room.ClientOptions.prototype} */ {

    setOptionsFromForm(indexedOptions) {
        this.isQuickGame = false;
        this.maxPlayers  = indexedOptions[FIELD_MAX_PLAYERS];
        this.levelset    = indexedOptions[FIELD_LEVEL_SET];
        this.hasPowerups = indexedOptions[FIELD_POWERUPS];
        this.isPrivate   = indexedOptions[FIELD_PRIVATE];
        this.isXSS       = indexedOptions[FIELD_XSS];
    }

});
