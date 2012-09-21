/*jshint globalstrict:true*/
/*globals XSS*/

'use strict';

// Copy or rename me to config.js
(function ClientServerSharedObject() {

    var config = {
        server: {
            host          : 'http://localhost:8080',
            socketIOScript: 'http://localhost:8080/socket.io/socket.io.js',
            indexFile     : '../index.html',
            sharedDir     : '../../shared/',
            tick          : 50
        },
        snake: {
            speed: 250,
            size : 10
        }
    };

    if (typeof XSS !== 'undefined') {
        XSS.config = config; // Client-side
    } else {
        module.exports = config; // Server-side
    }

})();