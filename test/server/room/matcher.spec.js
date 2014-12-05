'use strict';

describe('Server', function() {
describe('Room', function() {
describe('Matcher', function() {

    require('../../../dist/instrument/server/start.js');

    var room, matcher, matchingOptions;
    var dummyEmitter = jasmine.createSpyObj('dummyEdmitter', ['on', 'send']);
    var dummyLevelset = jasmine.createSpyObj('dummyLevelset', ['getRandomLevelIndex']);
    var dummyServer = {emitter: dummyEmitter};

    xss.levelsetRegistry = new xss.levelset.Registry();
    xss.levelsetRegistry.levelsets = [dummyLevelset];

    beforeEach(function() {
        matchingOptions = new xss.room.ServerOptions();
        room = new xss.room.ServerRoom(dummyServer, new xss.room.ServerOptions(), 'A');
        matcher = new xss.room.Matcher([room]);
    });

    it('Matches an empty room', function() {
        expect(matcher.getRoomMatching(matchingOptions))
            .toEqual(jasmine.any(xss.room.ServerRoom));
    });

    it('Does not match full rooms', function() {
        room.addPlayer(new xss.room.ServerPlayer(null, dummyEmitter));
        room.addPlayer(new xss.room.ServerPlayer(null, dummyEmitter));
        room.addPlayer(new xss.room.ServerPlayer(null, dummyEmitter));
        room.addPlayer(new xss.room.ServerPlayer(null, dummyEmitter));
        room.addPlayer(new xss.room.ServerPlayer(null, dummyEmitter));
        room.addPlayer(new xss.room.ServerPlayer(null, dummyEmitter));
        expect(matcher.getRoomMatching(matchingOptions)).toBeNull();
    });

    it('Does not match rooms when requesting a private room', function() {
        matchingOptions.isPrivate = true;
        expect(matcher.getRoomMatching(matchingOptions)).toBeNull();
    });

    it('Does not match rooms with non-matching options', function() {
        room.options.isXSS = true;
        expect(matcher.getRoomMatching(matchingOptions)).toBeNull();
    });

});
});
});
