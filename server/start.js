'use strict';

xss.server = new xss.Server();
xss.shapegen = new xss.ShapeGenerator();
xss.transform = new xss.Transform();
xss.levels = new xss.LevelRegistry();
xss.levels.onload = function() {
    xss.server.start();
    console.log('Snake server running on port ' + xss.server.port);
};
