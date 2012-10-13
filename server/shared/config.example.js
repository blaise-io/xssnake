/*jshint globalstrict:true*/
/*globals XSS*/

'use strict';

module.exports = {

    // Server-only config
    server: {
        pathToIndexFile: 'source/source.html' // From root
    },

    // Client-only config
    client: {
        socketio: {
            host  : 'http://localhost:8080',
            script: 'http://localhost:8080/socket.io/socket.io.js'
        }
    },

    // Config used by both client and server
    shared: {
        snake: {
            speed: 150,
            size : 4
        },
        game : {
            tick: 50
        }
    }

};

if (typeof XSS !== 'undefined') {
    XSS.config = module.exports;
}