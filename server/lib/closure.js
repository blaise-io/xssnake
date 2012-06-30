/**
 * Compile code using Google Closure Compiler's REST API
 */

/*jshint globalstrict:true, sub:true */
'use strict';


var fs = require('fs'),
    http = require('http'),
    querystring = require('querystring');

var code = '';

var addFiles = function() {
    for (var i = 0, m = arguments.length; i < m; i++) {
        code += fs.readFileSync(arguments[i]);
    }
};

var replace = function(string, haystack) {
    code = code.replace(string, haystack);
};

// https://developers.google.com/closure/compiler/docs/api-ref
var getCompilerConfigDefaults = function() {
    return {
        js_code          : code,
        compilation_level: 'ADVANCED_OPTIMIZATIONS',
        output_format    : 'json',
        output_info      : 'compiled_code'
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

var compile = function(outputFile, compilerConfigUser) {
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
            responseOK(response, outputFile);
        } else {
            responseFail(response);
        }
    });

    request.on('error', function(e) {
        console.log('Request error', e);
    });

    request.end(postdata);
};

var responseOK = function(response, outputFile) {
    var chunks = [];

    response.on('data', function(chunk) {
        chunks.push(chunk);
    });

    response.on('end', function() {
        writeToFile(chunks, outputFile);
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

var writeToFile = function(chunks, outputFile) {
    var json = JSON.parse(chunks.join(''));
    if (json && json['compiledCode']) {
        fs.writeFile(outputFile, json['compiledCode'], function(err) {
            if (!err) {
                console.info('Compiled code saved to', fs.realpathSync(outputFile));
            }
        });
    } else {
        console.error('Not json?', json);
    }
};

module.exports = {
    replace : replace,
    addFiles: addFiles,
    compile : compile
};