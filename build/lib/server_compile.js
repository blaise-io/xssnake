/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var fs = require('fs'),
    util = require('util');

/**
 * Compile Server files
 * Starts with the main file, inlines all non-core require()'s recursively,
 * removes all core require()'s and saves them for later inclusion.
 * @constructor
 */
function ServerCompile() {
    this.mainFile = __dirname + '/../../server/start.js';
    this.excludeFiles = [
        'config.example.js'
    ];
    this.moduleDirs = [
        __dirname + '/../../server/shared/',
        __dirname + '/../../server/lib/'
    ];

    this.populateFiles();
    this.inlineRequires();
    this.cleanCode();
}

module.exports = ServerCompile;

ServerCompile.prototype = {

    code: '',

    files: [],

    requiredStack: [],

    coreModules: [],

    populateFiles: function() {
        for (var i = 0, m = this.moduleDirs.length; i < m; i++) {
            var files = fs.readdirSync(this.moduleDirs[i]);
            for (var ii = 0, mm = files.length; ii < mm; ii++) {
                if (-1 === this.excludeFiles.indexOf(files[ii])) {
                    this.files.push(this.moduleDirs[i] + files[ii]);
                }
            }
        }
    },

    inlineRequires: function() {
        var requireRegExp = /[\w ]+ = require\('[\w\.\/_]+'\)(,|;)/g;
        this.code = String(fs.readFileSync(this.mainFile));
        while (requireRegExp.test(this.code)) {
            var matches = this.code.match(requireRegExp);
            for (var i = 0, m = matches.length; i < m; i++) {
                this.inlineRequire(matches[i]);
            }
        }
    },

    inlineRequire: function(requireCall) {
        var moduleName, varName;

        moduleName = requireCall.match(/\/?[\w\.]+'/g)[0];
        moduleName = moduleName.replace(/[\/']/g, '');

        varName = this.getVarName(requireCall);

        // Module is already inlined
        if (-1 !== this.requiredStack.indexOf(moduleName)) {
            var repl = util.format('// %s (already inlined)', moduleName);
            this.code = this.code.replace(requireCall, repl);
        }

        // Core module
        else if (!moduleName.match(/\.js/)) {
            // Append to list of core modules
            var coreModule = util.format(
                '%s = require(\'%s\')', varName, moduleName
            );
            // Remove from code; core modules should not be compiled
            this.code = this.code.replace(requireCall, '');
            this.requiredStack.push(moduleName);
            this.coreModules.push(coreModule);
        }

        // Inline module
        else {
            var jsContent, filePath = this.getFilePath(moduleName);

            if (!filePath) {
                console.log('Module not found:', moduleName);
                return;
            }

            jsContent = String(fs.readFileSync(filePath));

            // If module exports an object literal, use the reference name
            // for inlining.
            if (jsContent.match(/module\.exports = [^\w]/g)) {
                jsContent = jsContent.replace(
                    /module\.exports =/,
                    util.format('var %s = ', varName)
                );
            } else {
                // Module defines a named object. Comment-out the export.
                jsContent = jsContent.replace(/(module\.exports = .*)/, '// $1');
            }

            jsContent = util.format('// INLINED: %s\n%s\n', moduleName, jsContent);

            this.code = this.code.replace(requireCall, jsContent);
            this.requiredStack.push(moduleName);
        }
    },

    cleanCode: function() {
        this.code = this.code.replace(/'use strict';/g, '');
        this.code = this.code.replace(/XSS\.[\w]+ = module\.exports;/g, '');
    },

    getVarName: function(req) {
        return req.replace('var ', '').match(/([\w]+)/g)[0];
    },

    getFilePath: function(mod) {
        var files = this.files;
        for (var i = 0, m = files.length; i < m; i++) {
            if (files[i].match(mod)) {
                return files[i];
            }
        }
        return '';
    }
};