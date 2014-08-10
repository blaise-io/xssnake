'use strict';

xss.bootstrap.registerLevels = function(continueFn) {
    var basic, game, moving, maze;

    basic = new xss.levelset.Basic();
    basic.register(xss.level.BlankLevel);

    game = new xss.levelset.Game();
    moving = new xss.levelset.Moving();
    maze = new xss.levelset.Maze();

    xss.levelSetRegistry = new xss.levelset.Registry();
    xss.levelSetRegistry.register(basic);
    xss.levelSetRegistry.register(game);
    xss.levelSetRegistry.register(moving);
    xss.levelSetRegistry.register(maze);
    xss.levelSetRegistry.preloadLevels(continueFn);
};
