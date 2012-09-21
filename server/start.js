/*jshint globalstrict:true,es5:true*/
'use strict';

// XSSNAKE# supervisor -w server/ -n exit server/start.js

var config, Server;

config = require('../shared/config.js');
Server = require('./lib/server.js');
void(new Server(config));

console.log('Server is running...');