/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var Server = require('./lib/server.js');
var server = new Server();

server.preloadLevels(function(levels) {
    server.start(levels);
});
