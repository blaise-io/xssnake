'use strict';

xss.bootstrap.preloadAsyncData = function() {
    var preloadLevel = new xss.levels.BlankLevel(new xss.levelset.Config());
    preloadLevel.preload(xss.util.noop);
};
