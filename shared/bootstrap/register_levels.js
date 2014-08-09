'use strict';

xss.bootstrap.registerLevels = function(continueFn) {
    var basicLevelSet;

    basicLevelSet = new xss.levelset.Basic();
    basicLevelSet.register(xss.level.BlankLevel);

    xss.levelSetRegistry = new xss.levelset.Registry();
    xss.levelSetRegistry.register(basicLevelSet);
    xss.levelSetRegistry.preloadLevels(continueFn);
};
