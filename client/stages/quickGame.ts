/**
 * @extends {Game}
 * @implements {StageInterface}
 * @constructor
 */
export class QuickGame {
    constructor(QuickGame) {
    Game.call(this);
};

extend(QuickGame.prototype, Game.prototype);
extend(QuickGame.prototype, /** @lends {QuickGame.prototype} */ {

    getSerializedGameOptions() {
        var options = new ClientOptions();
        options.isQuickGame = true;
        return options.serialize();
    }

});
