'use strict';

xss.bootstrap.server();
xss.bootstrap.registerLevels(function() {
    xss.server = new xss.Server();
    console.log('XSSnake running on port ' + xss.server.port);
});
