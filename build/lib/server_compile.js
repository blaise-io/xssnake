/*jshint globalstrict:true, node:true, sub:true*/
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
    // The file that you would pass as the first parameter to node.
    this.mainFile = __dirname + '/../../server/start.js';

    // Files that should not be compiled.
    this.excludeFiles = [
        'config.default.js'
    ];

    // Directories containing all node.js module files that should be compiled.
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

    // String that contains all processed code.
    code: '',

    // Array containing all files that should be compiled.
    files: [],

    // Array containing all required modules so far.
    requiredStack: [],

    // Array containing all node.js core modules.
    coreModules: [],

    /**
     * Get all files configured in this.moduleDirs, and
     * push them to the this.files array. Exclude any files
     * that are in the this.excludeFiles array.
     * !!IMPORTANT: All files should have a unique name.
     */
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

    /**
     * Inline require() wrapper function. It starts with the main file. This
     * function reads the contents of that file and replaces every require()
     * call with the contents of the JS module file that is being required.
     * I call this process "inlining". This function performs the replace
     * recursively, so if the inlined code contains a require() call, it will
     * be replaced in the next iteration, unless it has already been inlined.
     */
    inlineRequires: function() {
        // Regular Expression for finding "var x = require('file.js');".
        var requireRegExp = /[\w ]+ = require\('[\w\.\/_]+'\)(,|;)/g;

        // Get the JS code from the main file.
        this.code = String(fs.readFileSync(this.mainFile));

        // Recursively replace all require() calls until they are all inlined.
        while (requireRegExp.test(this.code)) {
            var matches = this.code.match(requireRegExp);
            for (var i = 0, m = matches.length; i < m; i++) {
                this.inlineRequire(matches[i]);
            }
        }
    },

    /**
     * This function performs the actual replace of the require() string
     * to the contents of the module's JS contents.
     * @param {string} requireCall
     */
    inlineRequire: function(requireCall) {
        var moduleName, varName, repl;

        // Transform the entire "var x = require('module.js');" call to
        // "module.js", or "var http = require('http');" to "http".
        moduleName = requireCall.match(/\/?[\w\.]+'/g)[0];
        moduleName = moduleName.replace(/[\/']/g, '');

        // Get the variable name to which the require() call was asigned.
        // !!IMPORTANT (and that's why this library is a hack): Make sure that
        // (A) you assign the same require() calls consistently to the same
        // variable, and (B) make sure that you never assign two different
        // modules to the same variable across your entire project. If you
        // ignore A, you will get duplicate code. If you ignore B, you will
        // get errors because one library was ignored. This is because we have
        // one global namespace after we have inlined all require() modules.
        varName = this.getVarName(requireCall);

        // Our array this.requiredStack contains a list of all files that have
        // already been inlined. We only need to inline every file once, since
        // they will all be added to the global namespace. This snippet
        // will add a comment if the require() call was already inlined.
        if (-1 !== this.requiredStack.indexOf(moduleName)) {
            repl = util.format('// ALREADY INLINED: %s', moduleName);
            this.code = this.code.replace(requireCall, repl);
        }

        // Handle core modules. We detect a core module by checking if the
        // require() call contains ".js". We do not inline core modules because
        // they are too complex to inline. This snippet will comment out the
        // require call, and add the core module to a list of required core
        // modules. This list of core modules is then appended to the code AFTER
        // compiling.
        else if (!moduleName.match(/\.js/)) {
            // Append to list of core modules
            var coreModule = util.format(
                '%s = require(\'%s\')', varName, moduleName
            );
            repl = util.format('// CORE MODULE: %s', moduleName);
            // Comment-out core modules should not be compiled
            this.code = this.code.replace(requireCall, repl);
            this.requiredStack.push(moduleName);
            this.coreModules.push(coreModule);
        }

        // Inline a module. This segment matches the module name with our list
        // of files. If a match is found, we know the exact path where the file
        // can be included from, so that we can get its contents.
        else {
            var jsContent, filePath = this.getFilePath(moduleName);

            // Check if the module exists. If it doesn't, make sure to
            // add the files to the this.files array.
            if (!filePath) {
                console.log('ERROR: Module not found:', moduleName);
                return;
            }

            // Get the contents of the file
            jsContent = String(fs.readFileSync(filePath));

            // Remove the module.exports piece from the module's JS:

            // If the module exports an object literal, use the variable name
            // to which the require() call was assigned as a prefix for the
            // inlined code.
            // Example module:
            //      module.exports = {foo:'bar'};
            // Example require:
            //      var config = require('module.js');
            // Result:
            //      var config = {foo:'bar'};
            if (jsContent.match(/module\.exports = [^\w]/g)) {
                jsContent = jsContent.replace(
                    /module\.exports =/,
                    util.format('var %s = ', varName)
                );
            } else {
                // If the module exports a reference to a function, we ignore
                // the variable name that was used for the require() call.
                // Example module:
                //      var MyObject = function(){};
                //      module.exports = MyObject;
                // Example require:
                //      var config = require('module.js');
                // Result:
                //      var MyObject = function(){};
                jsContent = jsContent.replace(/(module\.exports = [\s\w{}\.\[\]]+)/, '// $1');
            }

            // !!IMPORTANT: This library currently does not support fragmented
            // exports. If you use this library, make sure you have a single
            // module.exports assignment.

            // Add a comment to the pre-compiled code for debugging
            jsContent = util.format('// INLINED: %s\n%s\n', moduleName, jsContent);

            // Replace the require call with the contents of the module file
            // that we have just adjusted a bit to remove the module.exports.
            this.code = this.code.replace(requireCall, jsContent);
            this.requiredStack.push(moduleName);
        }
    },

    /**
     * Clean up the code, handle an XSSNAKE-specific issue for
     * files that are used by both the client and the server
     */
    cleanCode: function() {
        this.code = this.code.replace(/'use strict';/g, '');
        this.code = this.code.replace(/(XSS|CONST)(.*=.*module\.exports)/g, '// $1$2');
    },

    /**
     * Get the variable name from a require() call.
     * Input:
     *      var foo = require('module.js');
     * Output:
     *      foo
     * @param {string} req
     * @return {string}
     */
    getVarName: function(req) {
        return req.replace('var ', '').match(/([\w]+)/g)[0];
    },

    /**
     * Get the file path for a module.
     * Input:
     *      foo.js
     * Output:
     *      /path/to/foo.js
     * @param mod
     * @return {*}
     */
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
