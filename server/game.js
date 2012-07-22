// XSSNAKE# supervisor -w server/ -n exit server/game.js

// TODO: var xss = require('./lib/state.js');
var xss = {
    clients    : {}, // {clientid1: socket, clientid2: socket}
    rooms      : {}, // {roomid: [clientid1, clientid2]}
    clientData : {}, // {clientid1: {}, clientid2: {}}
    clientPK   : 0   // Auto-incrementing int for unique primary keys
};

var levels = require('../shared/levels.js');
console.log(levels);

global.xss = xss;

xss.server = require('./lib/server.js');
xss.server.start();