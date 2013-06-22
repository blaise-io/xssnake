/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var assert = require('assert');
var Server = require('../server/lib/server.js');
var Client = require('../server/lib/client.js');
var Util = require('../server/shared/util.js');
var CONST = require('../server/shared/const.js');

describe('Rooms', function() {

    var server, roomManager, room, client, gameOptions, connectionDummy;

    connectionDummy = {write: Util.dummy};

    before(function(done) {
        server = new Server();
        server.preloadLevels(function(levels) {
            server.start(levels);
            done();
        });
    });

    after(function() {
        server.destruct();
    });

    beforeEach(function(done) {
        gameOptions = {};
        gameOptions[CONST.FIELD_MAX_PLAYERS] = 6;
        gameOptions[CONST.FIELD_DIFFICULTY] = CONST.FIELD_VALUE_MEDIUM;
        gameOptions[CONST.FIELD_POWERUPS] = true;
        gameOptions[CONST.FIELD_PRIVATE] = false;
        gameOptions[CONST.FIELD_XSS] = false;

        roomManager = server.roomManager;

        room = roomManager.createRoom(gameOptions);
        client = new Client(connectionDummy);

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
            var otherClient = new Client(connectionDummy);
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
            var notEqualGameOptions = Util.clone(gameOptions);
            notEqualGameOptions[CONST.FIELD_DIFFICULTY] = CONST.FIELD_VALUE_EASY;
            assert(!roomManager.gameOptionsMatch(notEqualGameOptions, room));
        });

        it('Not matching when requesting private room', function() {
            var gameOptionsPrivate = Util.clone(gameOptions);
            gameOptionsPrivate[CONST.FIELD_PRIVATE] = true;
            assert(!roomManager.gameOptionsMatch(gameOptionsPrivate, room));
        });

        it('Not matching when existing room is private', function() {
            var privateGameoptions = Util.clone(gameOptions);
            privateGameoptions[CONST.FIELD_PRIVATE] = true;
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
            var otherClient = new Client(connectionDummy);
            room.addClient(otherClient);
            room.removeClient(client);
            assert(room.isHost(otherClient));
        });

        it('Has points', function() {
            assert(room.rounds.score.points[0] === 0);
        });

    });

});
