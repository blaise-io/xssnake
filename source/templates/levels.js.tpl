/*jshint globalstrict:true*/
/*globals XSS*/

'use strict';

// Generated on %DATE%
// Generate file: `node build/parse_levels.js`
// Template file: source/templates/levels.js.tpl
(function ClientServerSharedObject() {

    var levels = %LEVELS%;

    if (typeof XSS !== 'undefined') {
        XSS.levels = levels; // Client-side
    } else {
        module.exports = levels; // Server-side
    }

})();