/*jshint globalstrict:true,es5:true*/
'use strict';

// XSSNAKE# supervisor -w server/ -n exit server/game.js

var config, Server;

config = {
    pathToHTML: __dirname + '/../index.html'
};

Server = require('./lib/server.js');
void(new Server(config));

console.log('Server is running...');