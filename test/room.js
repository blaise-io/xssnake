'use strict';

var assert = require('assert');

describe('Rooms', function() {

    var server, roomManager, room, client, gameOptions, connectionDummy;

    connectionDummy = {write: xss.util.noop};

    before(function(done) {
        server = new xss.Server();
        xss.levels = new xss.LevelRegistry();
        xss.levels.onload = function() {
            server.start();
            done();
        };
    });

    after(function() {
        server.destruct();
    });

    beforeEach(function(done) {
        gameOptions = {};
        gameOptions[xss.FIELD_MAX_PLAYERS] = 6;
        gameOptions[xss.FIELD_DIFFICULTY] = xss.FIELD_VALUE_MEDIUM;
        gameOptions[xss.FIELD_POWERUPS] = true;
        gameOptions[xss.FIELD_PRIVATE] = false;
        gameOptions[xss.FIELD_XSS] = false;

        roomManager = server.roomManager;

        room = roomManager.createRoom(gameOptions);
        client = new xss.Client(connectionDummy);

        done();
    });

    describe('Manager', function() {

        it('Creates room', function() {
            assert(typeof room === 'object');
        });

        it('Removes room', function() {
            var key = room.key;
            roomManager.remove(room);
            assert(typeof roomManager.rooms[key] === 'undefined');
        });

        it('Join room by key', function() {
            roomManager.joinRoomByKey(client, room.key);
            assert(room.clients.length === 1);
        });

    });

    describe('Room', function() {

        it('Remove when last client leaves', function() {
            room = roomManager.createRoom(gameOptions);
            var key = room.key;
            room.addClient(client);
            room.removeClient(client);
            assert(typeof roomManager.rooms[key] === 'undefined');
        });

        it('Restarting', function() {
            var otherClient = new xss.Client(connectionDummy);
            room.addClient(otherClient);
            room.addClient(client);
            room.restartRounds();
            assert(!!room.rounds, 'Rounds');
            assert(!!room.rounds.round, 'Round');
            assert(!!room.rounds.round.game, 'Game');
            assert(!!room.rounds.score, 'Score');
            assert(room.rounds.score.points[1] === 0, 'Points');
        });

    });

    describe('Game Options', function() {

        it('Matching when equal', function() {
            assert(typeof roomManager.gameOptionsMatch(gameOptions, room));
        });

        it('Not matching when not equal', function() {
            var notEqualGameOptions = xss.util.clone(gameOptions);
            notEqualGameOptions[xss.FIELD_DIFFICULTY] = xss.FIELD_VALUE_EASY;
            assert(!roomManager.gameOptionsMatch(notEqualGameOptions, room));
        });

        it('Not matching when requesting private room', function() {
            var gameOptionsPrivate = xss.util.clone(gameOptions);
            gameOptionsPrivate[xss.FIELD_PRIVATE] = true;
            assert(!roomManager.gameOptionsMatch(gameOptionsPrivate, room));
        });

        it('Not matching when existing room is private', function() {
            var privateGameoptions = xss.util.clone(gameOptions);
            privateGameoptions[xss.FIELD_PRIVATE] = true;
            room = roomManager.createRoom(privateGameoptions);
            assert(!roomManager.gameOptionsMatch(gameOptions, room));
        });

    });

    describe('Client', function() {

        beforeEach(function(done) {
            room.addClient(client);
            done();
        });

        it('Add to a room', function() {
            assert(room.clients.length === 1);
        });

        it('Remove from a room', function() {
            room.removeClient(client);
            assert(room.clients.length === 0);
        });

        it('Become host when previous host leaves', function() {
            var otherClient = new xss.Client(connectionDummy);
            room.addClient(otherClient);
            room.removeClient(client);
            assert(room.isHost(otherClient));
        });

        it('Has points', function() {
            assert(room.rounds.score.points[0] === 0);
        });

    });

});
