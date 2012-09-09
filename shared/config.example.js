/*jshint globalstrict:true*/
/*globals XSS*/

'use strict';

// Generated on Fri, 24 Aug 2012 12:18:37 GMT
// Generate file: `node server/levels.js`
// Template file: levels.tpl
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