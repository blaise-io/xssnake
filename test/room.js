/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var assert = require('assert');
var Server = require('../server/lib/server.js');
var RoomManager = require('../server/lib/room_manager.js');
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

        roomManager = new RoomManager(server);
        room = roomManager.createRoom(gameOptions);
        client = new Client(connectionDummy);

        done();
    });

    describe('Manager', function() {

        it('Creates room', function() {
            assert(typeof room === 'object');
        });

        it('Removes room', function() {
            var roomKey = room.key;
            roomManager.remove(room);
            assert(typeof roomManager.rooms[roomKey] === 'undefined');
        });

        it('Join room by key', function() {
            roomManager.joinRoomByKey(client, room.key);
            assert(room.clients.length === 1);
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

        it('Add to a room', function() {
            room.addClient(client);
            assert(room.clients.length === 1);
        });

        it('Remove from a room', function() {
            room.addClient(client);
            room.removeClient(client);
            assert(room.clients.length === 0);
        });

        it('Become host when previous host leaves', function() {
            var otherClient = new Client(connectionDummy);
            room.addClient(client);
            room.addClient(otherClient);
            room.removeClient(client);
            assert(room.isHost(otherClient));
        });

    });

});
