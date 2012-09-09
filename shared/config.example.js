/*jshint globalstrict:true*/
/*globals XSS*/

'use strict';

// Copy or rename me to config.js
(function ClientServerSharedObject() {

    var config = {
        server: {
            address: 'localhost:8080'
        },
        game: {
            tick : 50,
            speed: 200
        }
    };

    if (XSS) {
        XSS.config = config; // Client-side
    } else {
        module.exports = config; // Server-side
    }

})();