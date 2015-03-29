'use strict';

describe('Shared', function() {
describe('Room', function() {
describe('Player', function() {

    require('../../../dist/instrument/server/start.js');

    var player;

    beforeEach(function() {
        player = new xss.room.Player();
    });

    it('Deserialize equals serialize A', function() {
        player.score = 1;
        player.connectRoom = false;
        player.deserialize(player.serialize(false));

        expect(player.score).toBe(1, 'score');
        expect(player.connectRoom).toBe(false, 'connected');
        expect(player.local).toBe(false, 'local');
    });

    it('Deserialize equals serialize B', function() {
        player.score = 100;
        player.connectRoom = true;
        player.deserialize(player.serialize(true));

        expect(player.score).toBe(100, 'score');
        expect(player.connectRoom).toBe(true, 'connected');
        expect(player.local).toBe(true, 'local');
    });

    it('Deserialize equals serialize C', function() {
        player.score = 500;
        player.connectRoom = true;
        player.deserialize(player.serialize(false));

        expect(player.score).toBe(500, 'score');
        expect(player.connectRoom).toBe(true, 'connected');
        expect(player.local).toBe(false, 'local');
    });

    it('Deserialize equals serialize D', function() {
        player.score = 1000;
        player.connectRoom = false;
        player.deserialize(player.serialize(true));

        expect(player.score).toBe(1000, 'score');
        expect(player.connectRoom).toBe(false, 'connected');
        expect(player.local).toBe(true, 'local');
    });


});
});
});
