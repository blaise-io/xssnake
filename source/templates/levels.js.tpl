/*jshint globalstrict:true, es5:true, node:true, sub:true*/
/*globals XSS*/
'use strict';

// Generated on %%DATE%%
// Generate file: `node build/levels.js`
// Template file: source/templates/levels.js.tpl

module.exports = %%LEVELS%%;

if (typeof XSS !== 'undefined') {
    XSS.levels = module.exports;
}