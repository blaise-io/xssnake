'use strict';

describe('Client', function() {
describe('util', function() {
describe('xss.game.ClientGame', function() {

    var players, level, game;

    beforeEach(function(done) {
        players = new xss.room.ClientPlayerRegistry();
        level = new xss.levels.BlankLevel(new xss.levelset.Config());
        level.preload(function() {
            game = new xss.game.ClientGame(players, level);
            done();
        });
    });

    afterEach(function() {
        xss.shapes = {};
    });

    describe('Updates players', function() {
        var playerA, playerB;

        beforeEach(function() {
            playerA = new xss.room.ClientPlayer('A');
            players.add(playerA);
            game.updatePlayers(players);

            playerB = new xss.room.ClientPlayer('B');
            players.add(playerB);
            game.updatePlayers(players);
        });

        it('Should add snake A and B', function() {
            expect(xss.shapes.SNK0).toBeTruthy();
            expect(xss.shapes.SNK1).toBeTruthy();
        });

        it('Should add snake C', function() {
            var playerC = new xss.room.ClientPlayer('C');
            players.add(playerC);
            game.updatePlayers(players);
            expect(xss.shapes.SNK2).toBeTruthy();
        });

        it('Should remove snake A after removing', function() {
            players.players.length = 1;
            game.updatePlayers(players);
            // Players B should now be the first snake.
            expect(xss.shapes.SNK0).toBeTruthy();
            expect(xss.shapes.SNK1).toBeNull();
        });

        it('Should not show crash particles', function() {
            var crashed = false;
            Object.keys(xss.shapes).forEach(function(key) {
                if (key.substr(0,4) === 'EXPL' && xss.shapes[key] !== null) {
                    crashed = true;
                }
            });
            expect(crashed).toBeFalsy();
        });
    });

});
});
});
