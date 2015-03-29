'use strict';

xss.bootstrap.registerLevels = function(continueFn) {
    var basic, game, moving, maze;

    basic = new xss.levelset.Basic();
    //basic.register(xss.levels.ShiftedLineLevel);
    basic.register(xss.levels.LinesLevel);
    basic.register(xss.levels.CrosshairLevel);

    //game = new xss.levelset.Game();
    //moving = new xss.levelset.Moving();
    //maze = new xss.levelset.Maze();

    xss.levelsetRegistry = new xss.levelset.Registry();
    xss.levelsetRegistry.register(basic);
    //xss.levelSetRegistry.register(game);
    //xss.levelSetRegistry.register(moving);
    //xss.levelSetRegistry.register(maze);
    xss.levelsetRegistry.preloadLevels(continueFn);
};
