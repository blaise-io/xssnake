/*jshint globalstrict:true, node:true, sub:true*/
'use strict';

var assert = require('assert');
var Server = require('../server/lib/server.js');
var RoomManager = require('../server/lib/room_manager.js');
var Client = require('../server/lib/client.js');
var Util = require('../server/shared/util.js');
var CONST = require('../server/shared/const.js');

describe('Game', function() {

    var server, roomManager, room, round, game,
        client, otherClient, gameOptions, connectionDummy;

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

        client = new Client(connectionDummy);
        otherClient = new Client(connectionDummy);

        room = roomManager.createRoom(gameOptions);
        room.addClient(client);
        room.addClient(otherClient);

        round = room.rounds.round;
        game = round.game;
        game.start();

        done();
    });

    describe('Apple', function() {

        it('Spawn on start', function() {
            assert(game.spawner.numOfType(CONST.SPAWN_APPLE) === 1);
        });

        it('Respawn on hit', function() {
            game.hitApple(client, 0);
            assert(game.spawner.numOfType(CONST.SPAWN_APPLE) === 1);
        });

        it('Increase snake size', function() {
            game.hitApple(client, 0);
            assert(client.snake.size > CONST.SNAKE_SIZE);
        });

    });

    describe('Snake', function() {

        beforeEach(function(done) {
            client.snake.parts = [[1,0],[2,0],[3,0],[4,0]];
            client.snake.direction = 2;
            done();
        });

        it('Detect crash into wall', function() {
            game.updateSnake(client, [[2,0],[3,0],[4,0],[4,-1]], 1);
            assert(!!client.snake.crashed);
            assert(client.snake.limbo.type === CONST.CRASH_WALL);
        });

        it('Detect crash into opponent', function() {
            otherClient.snake.parts = [[4,3],[4,2],[4,1],[4,0]];
            game.updateSnake(client, [[1,0],[2,0],[3,0],[4,0]], 1);
            assert(!!client.snake.crashed);
            assert(client.snake.limbo.type === CONST.CRASH_OPPONENT);
        });

        it('Detect crash into opponent where result is a draw', function() {
            otherClient.snake.parts = [[5,3],[5,2],[5,1],[5,0]];
            otherClient.snake.direction = 0;
            game._applyNewPosition(otherClient);
            assert(!!otherClient.snake.limbo);
            assert(otherClient.snake.limbo.opponent === client);
            assert(otherClient.snake.limbo.type === CONST.CRASH_OPPONENT_DRAW);
        });

        it('Update snake parts', function() {
            var update = game.updateSnake(client, [[2,0],[3,0],[4,0],[5,0]], 0);
            assert(update === CONST.UPDATE_SUCCES);
            assert(client.snake.parts.length === 4);
            assert(client.snake.parts[0][0] === 2);
            assert(client.snake.parts[3][0] === 5);
        });

        it('Update snake direction', function() {
            var update = game.updateSnake(client, [[1,0],[2,0],[3,0],[4,0]], 1);
            assert(update === CONST.UPDATE_SUCCES);
            assert(client.snake.direction === 1);
        });

        it('Detect illegal gap', function() {
            var update = game.updateSnake(client, [[1,0],[2,0],[3,0],[5,0]], 0);
            assert(update === CONST.UPDATE_ERR_GAP);
        });

        it('Detect no common', function() {
            var update = game.updateSnake(client, [[5,0],[6,0],[7,0],[8,0]], 0);
            assert(update === CONST.UPDATE_ERR_NO_COMMON);
        });

        it('Disallow too many mismatches', function() {
            client.rtt = 100;
            client.snake.speed = 150;
            var update = game.updateSnake(client, [[3,0],[4,0],[5,0],[6,0]], 0);
            assert(update === CONST.UPDATE_ERR_MISMATCHES);
        });

        it('Allow more mismatches on high latency', function() {
            client.rtt = 150;
            client.snake.speed = 150;
            var update = game.updateSnake(client, [[3,0],[4,0],[5,0],[6,0]], 0);
            assert(update === CONST.UPDATE_SUCCES);
        });

        it('Allow more mismatches on high speed', function() {
            client.rtt = 100;
            client.snake.speed = 100;
            var update = game.updateSnake(client, [[3,0],[4,0],[5,0],[6,0]], 0);
            assert(update === CONST.UPDATE_SUCCES);
        });

    });

});
