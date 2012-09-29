/*jshint globalstrict:true*/
/*globals XSS*/

'use strict';

(function ClientServerSharedObject() {

    var config = {
        server: {
            host          : 'http://localhost:8080',
            socketIOScript: 'http://localhost:8080/socket.io/socket.io.js',
            indexFile     : '../source.html',
            tick          : 50
        },
        snake: {
            speed: 150,
            size : 3
        }
    };

    if (typeof XSS !== 'undefined') {
        XSS.config = config; // Client-side
    } else {
        module.exports = config; // Server-side
    }

})();