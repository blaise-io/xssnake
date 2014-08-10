'use strict';

var assert = require('assert');
var nodeEvents = require('events');


describe('Rooms', function() {

    var server, roomManager, room, client, otherClient, gameOptions, pubsubDummy,
        connectionDummy;

    pubsubDummy = new nodeEvents.EventEmitter();
    connectionDummy = {send: xss.util.noop, on: xss.util.noop};

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
        gameOptions[xss.FIELD_LEVEL_SET] = 0;
        gameOptions[xss.FIELD_POWERUPS] = true;
        gameOptions[xss.FIELD_PRIVATE] = false;
        gameOptions[xss.FIELD_XSS] = false;
        gameOptions[xss.FIELD_QUICK_GAME] = false;

        roomManager = server.roomManager;

        room = roomManager.createRoom(gameOptions);
        client = new xss.Client(pubsubDummy, connectionDummy);
        otherClient = new xss.Client(pubsubDummy, connectionDummy);

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
            var otherClient = new xss.Client(pubsubDummy, connectionDummy);
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

        it('Matching when quickjoin', function() {
            var oddGameOptions = xss.util.clone(gameOptions);
            oddGameOptions[xss.FIELD_DIFFICULTY] = xss.FIELD_VALUE_EASY;
            oddGameOptions[xss.FIELD_POWERUPS] = false;
            room = roomManager.createRoom(oddGameOptions);
            var quickJoinGameoptions = xss.util.clone(gameOptions);
            quickJoinGameoptions[xss.FIELD_QUICK_GAME] = true;
            assert(roomManager.gameOptionsMatch(quickJoinGameoptions, room));
        });

        it('Not matching quickjoin with private rooms', function() {
            var privateGameoptions = xss.util.clone(gameOptions);
            privateGameoptions[xss.FIELD_PRIVATE] = true;
            room = roomManager.createRoom(privateGameoptions);
            var quickGameOptions = xss.util.clone(gameOptions);
            quickGameOptions[xss.FIELD_QUICK_GAME] = true;
            assert(!roomManager.gameOptionsMatch(quickGameOptions, room));
        });

        it('Not matching quickjoin with xss', function() {
            var xssGameoptions = xss.util.clone(gameOptions);
            xssGameoptions[xss.FIELD_XSS] = true;
            room = roomManager.createRoom(xssGameoptions);
            var quickGameOptions = xss.util.clone(gameOptions);
            quickGameOptions[xss.FIELD_QUICK_GAME] = true;
            assert(!roomManager.gameOptionsMatch(quickGameOptions, room));
        });

        it('Not matching quickjoin with full rooms', function() {
            var FullGameOptions = xss.util.clone(gameOptions);
            FullGameOptions[xss.FIELD_MAX_PLAYERS] = 2;
            room = roomManager.createRoom(FullGameOptions);
            room.addClient(client);
            room.addClient(otherClient);
            var quickGameOptions = xss.util.clone(gameOptions);
            quickGameOptions[xss.FIELD_QUICK_GAME] = true;
            assert(!roomManager.gameOptionsMatch(quickGameOptions, room));
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
            var otherClient = new xss.Client(pubsubDummy, connectionDummy);
            room.addClient(otherClient);
            room.removeClient(client);
            assert(room.isHost(otherClient));
        });

        it('Has points', function() {
            assert(room.rounds.score.points[0] === 0);
        });

    });

});
