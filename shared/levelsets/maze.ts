/**
 * @extends {levelset.Levelset}
 * @constructor
 */
export class Maze {
    constructor(Maze) {
    levelset.Levelset.apply(this, arguments);
    this.title = COPY_LEVELSET_MAZE;
};

extend(levelset.Maze.prototype, levelset.Levelset.prototype);
extend(levelset.Maze.prototype, /** @lends {levelset.Maze.prototype} */ {

});
