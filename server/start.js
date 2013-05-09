/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var Server = require('./lib/server.js');
global.server = new Server();
