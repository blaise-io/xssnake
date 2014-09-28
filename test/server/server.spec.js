'use strict';

describe('Server', function() {

    var xss = require('../../dist/instrument/server.js');

    it('Starts', function(done) {
        xss.bootstrap.server();
        xss.bootstrap.registerLevels(function() {
            xss.server = new xss.netcode.Server();
            expect(xss.server.ws).toBeDefined();
            done();
        });
    });

    it('Stops', function() {
        xss.server.destruct();
        expect(xss.server.roomManager).toBeNull();
    });

});
