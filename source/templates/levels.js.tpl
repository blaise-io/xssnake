/*jshint globalstrict:true*/
/*globals XSS*/

'use strict';

// Generated on %DATE%
// Generate file: `node build/parse_levels.js`
// Template file: source/templates/levels.js.tpl

module.exports = %LEVELS%;

if (typeof XSS !== 'undefined') {
    XSS.levels = module.exports;
}