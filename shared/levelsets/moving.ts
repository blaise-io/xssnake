/**
 * @extends {levelset.Levelset}
 * @constructor
 */
export class Moving {
    constructor(Moving) {
    levelset.Levelset.apply(this, arguments);
    this.title = COPY_LEVELSET_MOVING;
};

extend(levelset.Moving.prototype, levelset.Levelset.prototype);
extend(levelset.Moving.prototype, /** @lends {levelset.Moving.prototype} */ {

});
