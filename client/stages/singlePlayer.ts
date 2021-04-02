/**
 * @constructor
 * @implements {StageInterface}
 * @extends {Game}
 */
export class SinglePlayer {
    constructor(SinglePlayer) {
    Game.call(this);
};

extend(SinglePlayer.prototype, Game.prototype);
extend(SinglePlayer.prototype, /** @lends {SinglePlayer.prototype} */ {

    getSerializedGameOptions() {
        var options = new ClientOptions();
        options.maxPlayers = 1;
        options.isPrivate = true;
        return options.serialize();
    }

});
