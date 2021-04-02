// Global namespace.
// This is to allow code sharing between client and server.
global.xss = {};

// Include all server dependencies.
var grunt = require('grunt');
var server = require('../build/server.js');
var files = grunt.file.expand(server.concat.src);
for (var i = 0, m = files.length; i < m; i++) {
    require(__dirname + '/../' + files[i]);
}

// Don't start server when testing.
// istanbul ignore if
if (typeof jasmine === 'undefined') {
    bootstrap.server();
    bootstrap.registerLevels(function() {
        server = new netcode.Server();
        console.log('XSSnake running at ' + SERVER_ENDPOINT);
    });
}
