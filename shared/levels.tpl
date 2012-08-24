/*jshint globalstrict:true*/
/*globals XSS*/

'use strict';

// Generated on %DATE%
// Generate file: `node server/levels.js`
// Template file: levels.tpl
(function ClientServerSharedObject() {

    var levels = %LEVELS%;

    if (XSS) {
        XSS.levels = levels; // Client-side
    } else {
        module.exports = levels; // Server-side
    }

})();