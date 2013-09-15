/*globals XSS:true*/

// Generated on %%DATE%%
// Generate file: `node build/levels.js`
// Template file: client/templates/levels.js.tpl

module.exports = %%LEVELS%%;

if (typeof XSS !== 'undefined') {
    XSS.levels = module.exports;
}
