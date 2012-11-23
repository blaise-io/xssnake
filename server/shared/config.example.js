/*jshint globalstrict:true, es5:true, node:true*/
/*globals XSS*/

'use strict';

module.exports = {

    // Server-only config
    server: {
        pathToIndexFile: 'source/source.html' // From root
    },

    // Client-only config
    client: {
        ui: {
            maxNameWidth: 40
        },
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
        game: {
            capacity : 4,
            tick     : 50,
            countdown: 3,
            gloat    : 3
        }
    }

};

if (typeof XSS !== 'undefined') {
    XSS.config = module.exports;
}