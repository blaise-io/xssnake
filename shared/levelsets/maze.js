'use strict';

/**
 * @extends {xss.levelset.Levelset}
 * @constructor
 */
xss.levelset.Maze = function() {
    xss.levelset.Levelset.apply(this, arguments);
    this.title = xss.COPY_LEVELSET_MAZE;
};

xss.util.extend(xss.levelset.Maze.prototype, xss.levelset.Levelset.prototype);
xss.util.extend(xss.levelset.Maze.prototype, {

});
