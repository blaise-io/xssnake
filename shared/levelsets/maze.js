'use strict';

/**
 * @extends {xss.levelset.Base}
 * @constructor
 */
xss.levelset.Maze = function() {
    xss.levelset.Base.apply(this, arguments);
    this.title = xss.COPY_LEVELSET_MAZE;
};

xss.util.extend(xss.levelset.Maze.prototype, xss.levelset.Base.prototype);
xss.util.extend(xss.levelset.Maze.prototype, {

});
