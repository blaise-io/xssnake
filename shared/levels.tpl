/*jshint globalstrict:true*/
/*globals XSS*/

'use strict';

// Generated on %DATE%
// Generate this file using `node server/levels.js`
// Shared object wrapper
(function ClientServerSharedObject() {

    var levels = %LEVELS%;

    if (XSS) {
        XSS.levels = levels; // Client-side
    } else {
        module.exports = levels; // Server-side
    }

})();