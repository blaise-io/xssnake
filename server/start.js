'use strict';

var Server = require('./lib/server.js');
var server = new Server();

server.preloadLevels(function(levels) {
    server.start(levels);
    console.log('Snake server running on port ' + server.port);
});
