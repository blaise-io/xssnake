/**
 * @extends {levelset.Levelset}
 * @constructor
 */
export class Game {
    constructor(Game) {
    levelset.Levelset.apply(this, arguments);
    this.title = COPY_LEVELSET_GAME;
};

extend(levelset.Game.prototype, levelset.Levelset.prototype);
extend(levelset.Game.prototype, /** @lends {levelset.Game.prototype} */ {

});
