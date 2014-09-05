'use strict';

xss.bootstrap.server();
xss.bootstrap.registerLevels(function() {
    xss.server = new xss.netcode.Server();
    console.log('XSSnake running at ' + xss.SERVER_ENDPOINT);
});
