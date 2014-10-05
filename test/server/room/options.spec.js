'use strict';

describe('Server', function() {
describe('Room', function() {
describe('Options', function() {

    require('../../../dist/instrument/server/start.js');

    var defaultOptions;

    beforeEach(function() {
        defaultOptions = {};
        defaultOptions[xss.FIELD_QUICK_GAME] = false;
        defaultOptions[xss.FIELD_MAX_PLAYERS] = 6;
        defaultOptions[xss.FIELD_LEVEL_SET] = 0;
        defaultOptions[xss.FIELD_POWERUPS] = true;
        defaultOptions[xss.FIELD_PRIVATE] = false;
        defaultOptions[xss.FIELD_XSS] = false;

        xss.levelSetRegistry = new xss.levelset.Registry();
        xss.levelSetRegistry.levelsets = new Array(2);
    });

    it('Matches when options are equal', function() {
        var existingOptions = new xss.room.Options(xss.util.clone(defaultOptions));
        var requestOptions = new xss.room.Options(xss.util.clone(defaultOptions));
        expect(existingOptions.matches(requestOptions)).toBeTruthy();
    });

    it('Matches when requester wants a quick game', function() {
        var existingOptions = xss.util.clone(defaultOptions);
        var requestOptions = xss.util.clone(defaultOptions);

        requestOptions[xss.FIELD_QUICK_GAME] = true;

        expect(new xss.room.Options(existingOptions).matches(
            new xss.room.Options(requestOptions))).toBeTruthy();

        existingOptions[xss.FIELD_MAX_PLAYERS] = 2;
        existingOptions[xss.FIELD_LEVEL_SET] = 1;
        existingOptions[xss.FIELD_POWERUPS] = false;

        expect(new xss.room.Options(existingOptions).matches(
            new xss.room.Options(requestOptions))
        ).toBeTruthy('Ignores mismatches in max players, level sets, powerups');
    });

    it('Does not apply for quick game when room is private', function() {
        var existingOptions = xss.util.clone(defaultOptions);
        var requestOptions = xss.util.clone(defaultOptions);
        existingOptions[xss.FIELD_PRIVATE] = true;
        expect(new xss.room.Options(existingOptions).matches(
            new xss.room.Options(requestOptions))
        ).toBeFalsy();
    });

    it('Does not apply for quick game when room has XSS enabled', function() {
        var existingOptions = xss.util.clone(defaultOptions);
        var requestOptions = xss.util.clone(defaultOptions);
        existingOptions[xss.FIELD_XSS] = true;
        expect(new xss.room.Options(existingOptions).matches(
            new xss.room.Options(requestOptions))
        ).toBeFalsy();
    });

});
});
});
