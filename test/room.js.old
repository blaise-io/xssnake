'use strict';

var assert = require('assert');
var nodeEvents = require('events');


describe('Rooms', function() {

    var server, roomManager, room, client, otherClient, roomPreferences, pubsubDummy,
        connectionDummy;

    pubsubDummy = new nodeEvents.EventEmitter();
    connectionDummy = {send: xss.util.noop, on: xss.util.noop};

    before(function(done) {
        server = new xss.netcode.Server();
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
        roomPreferences = {};
        roomPreferences[xss.FIELD_MAX_PLAYERS] = 6;
        roomPreferences[xss.FIELD_LEVEL_SET] = 0;
        roomPreferences[xss.FIELD_POWERUPS] = true;
        roomPreferences[xss.FIELD_PRIVATE] = false;
        roomPreferences[xss.FIELD_XSS] = false;
        roomPreferences[xss.FIELD_QUICK_GAME] = false;

        roomManager = server.roomManager;

        room = roomManager.createRoom(roomPreferences);
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
            room = roomManager.createRoom(roomPreferences);
            var key = room.key;
            room.addPlayer(client);
            room.removeClient(client);
            assert(typeof roomManager.rooms[key] === 'undefined');
        });

        it('Restarting', function() {
            var otherClient = new xss.Client(pubsubDummy, connectionDummy);
            room.addPlayer(otherClient);
            room.addPlayer(client);
            room.restartRounds();
            assert(!!room.rounds, 'Rounds');
            assert(!!room.rounds.round, 'Round');
            assert(!!room.rounds.round.game, 'Game');
            assert(!!room.rounds.score, 'Score');
            assert(room.rounds.score.points[1] === 0, 'Points');
        });

    });

    describe('Game Config', function() {

        it('Matching when equal', function() {
            assert(typeof roomManager.roomPreferencesMatch(roomPreferences, room));
        });

        it('Not matching when not equal', function() {
            var notEqualGameOptions = xss.util.clone(roomPreferences);
            notEqualGameOptions[xss.FIELD_DIFFICULTY] = xss.FIELD_VALUE_EASY;
            assert(!roomManager.roomPreferencesMatch(notEqualGameOptions, room));
        });

        it('Not matching when requesting private room', function() {
            var roomPreferencesPrivate = xss.util.clone(roomPreferences);
            roomPreferencesPrivate[xss.FIELD_PRIVATE] = true;
            assert(!roomManager.roomPreferencesMatch(roomPreferencesPrivate, room));
        });

        it('Not matching when existing room is private', function() {
            var privateGameoptions = xss.util.clone(roomPreferences);
            privateGameoptions[xss.FIELD_PRIVATE] = true;
            room = roomManager.createRoom(privateGameoptions);
            assert(!roomManager.roomPreferencesMatch(roomPreferences, room));
        });

        it('Matching when quickjoin', function() {
            var oddGameOptions = xss.util.clone(roomPreferences);
            oddGameOptions[xss.FIELD_DIFFICULTY] = xss.FIELD_VALUE_EASY;
            oddGameOptions[xss.FIELD_POWERUPS] = false;
            room = roomManager.createRoom(oddGameOptions);
            var quickJoinGameoptions = xss.util.clone(roomPreferences);
            quickJoinGameoptions[xss.FIELD_QUICK_GAME] = true;
            assert(roomManager.roomPreferencesMatch(quickJoinGameoptions, room));
        });

        it('Not matching quickjoin with private rooms', function() {
            var privateGameoptions = xss.util.clone(roomPreferences);
            privateGameoptions[xss.FIELD_PRIVATE] = true;
            room = roomManager.createRoom(privateGameoptions);
            var quickGameOptions = xss.util.clone(roomPreferences);
            quickGameOptions[xss.FIELD_QUICK_GAME] = true;
            assert(!roomManager.roomPreferencesMatch(quickGameOptions, room));
        });

        it('Not matching quickjoin with xss', function() {
            var xssGameoptions = xss.util.clone(roomPreferences);
            xssGameoptions[xss.FIELD_XSS] = true;
            room = roomManager.createRoom(xssGameoptions);
            var quickGameOptions = xss.util.clone(roomPreferences);
            quickGameOptions[xss.FIELD_QUICK_GAME] = true;
            assert(!roomManager.roomPreferencesMatch(quickGameOptions, room));
        });

        it('Not matching quickjoin with full rooms', function() {
            var FullGameOptions = xss.util.clone(roomPreferences);
            FullGameOptions[xss.FIELD_MAX_PLAYERS] = 2;
            room = roomManager.createRoom(FullGameOptions);
            room.addPlayer(client);
            room.addPlayer(otherClient);
            var quickGameOptions = xss.util.clone(roomPreferences);
            quickGameOptions[xss.FIELD_QUICK_GAME] = true;
            assert(!roomManager.roomPreferencesMatch(quickGameOptions, room));
        });
    });

    describe('Client', function() {

        beforeEach(function(done) {
            room.addPlayer(client);
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
            room.addPlayer(otherClient);
            room.removeClient(client);
            assert(room.isHost(otherClient));
        });

        it('Has points', function() {
            assert(room.rounds.score.points[0] === 0);
        });

    });

});
