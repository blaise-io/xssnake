/*jshint globalstrict:true, node:true, sub:true*/
'use strict';

var assert = require('assert');

describe('Google Closure Compiling', function() {

    describe('Client', function() {
        var json;

        before(function(done) {
            this.timeout(10 * 3000); // Google Closure can be slow
            var gcc = require(__dirname + '/../build/client.js');
            gcc.compilePassJson(function(result) {
                json = result;
                done();
            });
        });

        it('Produces compiled code', function() {
            assert(typeof json.compiledCode === 'string');
            assert(json.compiledCode.length > 1024);
        });

        it('Does not produce errors', function() {
            assert(typeof json.errors === 'undefined');
        });

        it('Does not produce warnings', function() {
            assert(typeof json.warnings === 'undefined');
        });

    });

    describe('Server', function() {
        var json;

        before(function(done) {
            this.timeout(10 * 3000); // Google Closure can be slow
            var gcc = require(__dirname + '/../build/server.js');
            gcc.compilePassJson(function(result) {
                json = result;
                done();
            });
        });

        it('Produces compiled code', function() {
            assert(typeof json.compiledCode === 'string');
            assert(json.compiledCode.length > 1024);
        });

        it('Does not produce errors', function() {
            assert(typeof json.errors === 'undefined');
        });

        it('Does not produce warnings', function() {
            assert(typeof json.warnings === 'undefined');
        });

    });

});

