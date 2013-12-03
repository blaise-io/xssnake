'use strict';

xss.server = new xss.Server();

xss.server.preloadLevels(function(levels) {
    xss.shapegen = new xss.ShapeGenerator();
    xss.transform = new xss.Transform();
    xss.server.start(levels);
    console.log('Snake server running on port ' + xss.server.port);
});
