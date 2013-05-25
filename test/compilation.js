/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var assert = require('assert');
var gccClient = require(__dirname + '/../build/client.js');
var gccServer = require(__dirname + '/../build/client.js');

describe('XSSNAKE Compilation', function() {

    describe('Client', function() {
        var json;

        before(function(done) {
            this.timeout(10 * 1000);
            gccClient.compilePassJson(function(result) {
                json = result;
                done();
            });
        });

        it('should produce compiled code', function() {
            assert(json.compiledCode);
        });

        it('should produce not produce errors', function() {
            assert(typeof json.errors === 'undefined');
        });

        it('should not produce warnings', function() {
            assert(typeof json.warnings === 'undefined');
        });

    });

    describe('Server', function() {
        var json;

        before(function(done) {
            this.timeout(10 * 1000);
            gccServer.compilePassJson(function(result) {
                json = result;
                done();
            });
        });

        it('should produce compiled code', function() {
            assert(json.compiledCode);
        });

        it('should produce not produce errors', function() {
            assert(typeof json.errors === 'undefined');
        });

        it('should not produce warnings', function() {
            assert(typeof json.warnings === 'undefined');
        });

    });

});

