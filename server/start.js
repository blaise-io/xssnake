'use strict';

xss.server = new xss.Server();

xss.server.preloadLevels(function(levels) {
    xss.server.start(levels);
    console.log('Snake server running on port ' + xss.server.port);
});
