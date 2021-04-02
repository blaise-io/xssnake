class registerLevels {
    constructor(registerLevels) {
    var basic, game, moving, maze;

    basic = new levelset.Basic();
    //basic.register(levels.ShiftedLineLevel);
    basic.register(levels.LinesLevel);
    basic.register(levels.CrosshairLevel);

    //game = new levelset.Game();
    //moving = new levelset.Moving();
    //maze = new levelset.Maze();

    levelsetRegistry = new levelset.Registry();
    State.levelsetRegistry.register(basic);
    //levelSetRegistry.register(game);
    //levelSetRegistry.register(moving);
    //levelSetRegistry.register(maze);
    State.levelsetRegistry.preloadLevels(continueFn);
};
