var assert = require('assert');


describe('Game', function() {

    var server, roomManager, room, round, game,
        client, otherClient, gameOptions, connectionDummy;

    connectionDummy = {write: xss.util.dummy};

    before(function(done) {
        server = new xss.Server();
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
        gameOptions[xss.FIELD_MAX_PLAYERS] = 6;
        gameOptions[xss.FIELD_DIFFICULTY] = xss.FIELD_VALUE_MEDIUM;
        gameOptions[xss.FIELD_POWERUPS] = true;
        gameOptions[xss.FIELD_PRIVATE] = false;
        gameOptions[xss.FIELD_XSS] = false;

        roomManager = new xss.RoomManager(server);

        client = new xss.Client(connectionDummy);
        otherClient = new xss.Client(connectionDummy);

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
            assert(game.spawner.numOfType(xss.SPAWN_APPLE) === 1);
        });

        it('Respawn on hit', function() {
            game.hitApple(client, 0);
            assert(game.spawner.numOfType(xss.SPAWN_APPLE) === 1);
        });

        it('Increase snake size', function() {
            game.hitApple(client, 0);
            assert(client.snake.size > xss.SNAKE_SIZE);
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
            assert(client.snake.limbo.type === xss.CRASH_WALL);
        });

        it('Detect crash into opponent', function() {
            otherClient.snake.parts = [[4,3],[4,2],[4,1],[4,0]];
            game.updateSnake(client, [[1,0],[2,0],[3,0],[4,0]], 1);
            assert(!!client.snake.crashed);
            assert(client.snake.limbo.type === xss.CRASH_OPPONENT);
        });

        it('Detect crash into opponent where result is a draw', function() {
            otherClient.snake.parts = [[5,3],[5,2],[5,1],[5,0]];
            otherClient.snake.direction = 0;
            game._applyNewPosition(otherClient);
            assert(!!otherClient.snake.limbo);
            assert(otherClient.snake.limbo.opponent === client);
            assert(otherClient.snake.limbo.type === xss.CRASH_OPPONENT_DRAW);
        });

        it('Update snake parts', function() {
            var update = game.updateSnake(client, [[2,0],[3,0],[4,0],[5,0]], 0);
            assert(update === xss.UPDATE_SUCCES);
            assert(client.snake.parts.length === 4);
            assert(client.snake.parts[0][0] === 2);
            assert(client.snake.parts[3][0] === 5);
        });

        it('Update snake direction', function() {
            var update = game.updateSnake(client, [[1,0],[2,0],[3,0],[4,0]], 1);
            assert(update === xss.UPDATE_SUCCES);
            assert(client.snake.direction === 1);
        });

        it('Detect illegal gap', function() {
            var update = game.updateSnake(client, [[1,0],[2,0],[3,0],[5,0]], 0);
            assert(update === xss.UPDATE_ERR_GAP);
        });

        it('Detect no common', function() {
            var update = game.updateSnake(client, [[5,0],[6,0],[7,0],[8,0]], 0);
            assert(update === xss.UPDATE_ERR_NO_COMMON);
        });

        it('Disallow too many mismatches', function() {
            client.rtt = 100;
            client.snake.speed = 150;
            var update = game.updateSnake(client, [[3,0],[4,0],[5,0],[6,0]], 0);
            assert(update === xss.UPDATE_ERR_MISMATCHES);
        });

        it('Allow more mismatches on high latency', function() {
            client.rtt = 150;
            client.snake.speed = 150;
            var update = game.updateSnake(client, [[3,0],[4,0],[5,0],[6,0]], 0);
            assert(update === xss.UPDATE_SUCCES);
        });

        it('Allow more mismatches on high speed', function() {
            client.rtt = 100;
            client.snake.speed = 100;
            var update = game.updateSnake(client, [[3,0],[4,0],[5,0],[6,0]], 0);
            assert(update === xss.UPDATE_SUCCES);
        });

    });

});
