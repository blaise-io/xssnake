/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var fs = require('fs'),
    util = require('util');

/**
 * @constructor
 */
function ServerCompile() {
    this.moduleDirs = [
        __dirname + '/../../server/shared/',
        __dirname + '/../../server/lib/'
    ];

    this.excludeFiles = ['config.example.js'];

    this.mainFile = __dirname + '/../../server/start.js';

    this.populateFiles();
    this.inlineRequires();
    this.cleanCode();
}

module.exports = ServerCompile;

ServerCompile.prototype = {

    code: '',

    requiredStack: [],

    coreModules: [],

    files: [],

    requireRE: /[\w ]+ = require\('[\w\.\/_]+'\)(,|;)/g,

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
        this.code = String(fs.readFileSync(this.mainFile));
        while (this.requireRE.test(this.code)) {
            var matches = this.code.match(this.requireRE);
            for (var i = 0, m = matches.length; i < m; i++) {
                this.inlineRequire(matches[i]);
            }
        }
    },

    inlineRequire: function(req) {
        var mod, varName;

        mod = req.match(/\/?[\w\.]+'/g)[0];
        mod = mod.replace(/[\/']/g, '');

        varName = this.getVarName(req);

        // Module is already inlined
        if (-1 !== this.requiredStack.indexOf(mod)) {
            var repl = util.format('// %s (already inlined)', mod);
            this.code = this.code.replace(req, repl);
        }

        // Core module
        else if (!mod.match(/\.js/)) {
            var coreModule = util.format('%s = require(\'%s\')', varName, mod);
            this.code = this.code.replace(req, ''); // Remove from code
            this.requiredStack.push(mod);
            this.coreModules.push(coreModule);
        }

        // Inline module
        else {
            var moduleJS, filePath = this.getFilePath(mod);

            if (!filePath) {
                console.log('Module not found:', mod);
                return;
            }

            moduleJS = String(fs.readFileSync(filePath));

            // If module exports an object literal, use the reference name
            // for inlining.
            if (moduleJS.match(/module\.exports = [^\w]/g)) {
                moduleJS = moduleJS.replace(
                    /module\.exports =/,
                    util.format('var %s = ', varName)
                );
            } else {
                // Module defines a named object. Comment-out the export.
                moduleJS = moduleJS.replace(/(module\.exports = .*)/, '// $1');
            }

            moduleJS = util.format('// INLINED: %s\n%s\n', mod, moduleJS);

            this.code = this.code.replace(req, moduleJS);
            this.requiredStack.push(mod);
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