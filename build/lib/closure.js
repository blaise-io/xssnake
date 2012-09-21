/*jshint globalstrict:true,es5:true*/
'use strict';

/**
 * Compile code using Google Closure Compiler's REST API
 */

var fs = require('fs'),
    http = require('http'),
    querystring = require('querystring');

var _header = '';
var _code = '';
var _externs = '';

var addFiles = function() {
    for (var i = 0, m = arguments.length; i < m; i++) {
        _code += fs.readFileSync(arguments[i]);
    }
};

var replace = function(string, haycourse) {
    _code = _code.replace(string, haycourse);
};

var externs = function(externs) {
    _externs = externs;
};

// https://developers.google.com/closure/compiler/docs/api-ref
var getCompilerConfigDefaults = function() {
    return {
        js_code          : _code,
        js_externs       : _externs,
        warning_level    : 'VERBOSE',
        language         : 'ECMASCRIPT5_STRICT',
        compilation_level: 'ADVANCED_OPTIMIZATIONS',
        output_format    : 'json',
        output_info      : ['compiled_code', 'errors', 'warnings', 'statistics']
    };
};

var getCompilerEndpoint = function() {
    return {
        hostname: 'closure-compiler.appspot.com',
        path    : '/compile',
        method  : 'POST',
        headers : {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
};

var compile = function(file, compilerConfigUser) {
    var request, postdata,
        compilerConfig = getCompilerConfigDefaults(),
        compilerEndpoint = getCompilerEndpoint();

    for (var k in compilerConfigUser) {
        if (compilerConfigUser.hasOwnProperty(k)) {
            compilerConfig[k] = compilerConfigUser[k];
        }
    }

    postdata = querystring.stringify(compilerConfig);

    request = http.request(compilerEndpoint, function(response) {
        response.setEncoding('utf8');
        if (response.statusCode === 200) {
            responseOK(file, response);
        } else {
            responseFail(response);
        }
    });

    request.on('error', function(e) {
        console.log('Request error', e);
    });

    request.end(postdata);
};

var header = function(str) {
    _header = str;
};

var responseOK = function(file, response) {
    var chunks = [];

    response.on('data', function(chunk) {
        chunks.push(chunk);
    });

    response.on('end', function() {
        var json = JSON.parse(chunks.join(''));
        showCompilerMessages(json);
        /** @namespace json.compiledCode {String} */
        writeOutputTofile(file, json.compiledCode);
    });
};

var responseFail = function(response) {
    console.error('Response went wrong!');
    console.info('Status', response.statusCode);
    console.info('Headers', response.headers);
    response.on('data', function(chunk) {
        console.info('Body', chunk);
    });
};

var showCompilerMessages = function(json) {
    var stats, shaved, kb;

    /** @namespace json.warnings {Object} */
    if (json.warnings) {
        console.warn('warnings:', json.warnings);
    }

    /** @namespace json.errors {Object} */
    if (json.errors) {
        console.error('errors:', json.errors);
    }

    /** @namespace json.statistics {Object} */
    /** @namespace json.statistics.originalSize */
    /** @namespace json.statistics.compressedSize */
    /** @namespace json.statistics.compressedGzipSize */
    if (json.statistics) {

        stats = json.statistics;
        shaved = (100 - (stats.compressedSize / stats.originalSize * 100)).toPrecision(3);
        kb = function(bytes) {
            return Math.round(bytes / 10.24) / 100 + ' KB';
        };

        console.info();
        console.info('      Original', kb(stats.originalSize));
        console.info('    Compressed', kb(stats.compressedSize));
        console.info('     + GZipped', kb(stats.compressedGzipSize));
        console.info('       Reduced', shaved + '%');
        console.info();
    }
};

var writeOutputTofile = function(file, code) {
    if (!code) {
        console.error('No code to save.');
    } else {
        file = fs.realpathSync(file);
        fs.writeFile(file, _header + code, function(err) {
            if (!err) {
                console.info('Compiled code saved to', file);
            } else {
                console.info('Saving code failed to', file);
            }
        });
    }
};

module.exports = {
    replace : replace,
    externs : externs,
    header  : header,
    addFiles: addFiles,
    compile : compile
};