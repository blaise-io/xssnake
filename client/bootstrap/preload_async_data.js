"use strict";

xss.bootstrap.preloadAsyncData = function () {
    const preloadLevel = new xss.levels.BlankLevel(new xss.levelset.Config());
    preloadLevel.preload(xss.util.noop);
};
