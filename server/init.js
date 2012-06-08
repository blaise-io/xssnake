// X:\dir\to\root supervisor -n exit -w server server/init.js

global.xss = {
    events     : new (require('events')).EventEmitter(), // Global events hook
    clients    : {}, // Array with [id, connection] for every connected client
    clientData : {}, // Object containing data for every client
    clientPK   : 1   // Auto-incrementing int for unique primary keys
};

require('./server.js').start();
require('./clients.js').start();
require('./chat.js').start();