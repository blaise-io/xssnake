'use strict';

describe('Client', function() {
describe('xss.game.ClientGame', function() {
    var players, level, game;

    beforeEach(function(done) {
        players = new xss.room.ClientPlayerRegistry();
        level = new xss.levels.BlankLevel(new xss.levelset.Config());
        level.preload(function() {
            game = new xss.game.ClientGame(level, players);
            done();
        });
    });

    afterEach(function() {
        xss.shapes = {};
    });

    describe('Updates players', function() {
        var playerA, playerB, playerC;

        beforeEach(function() {
            playerA = new xss.room.ClientPlayer('A');
            playerB = new xss.room.ClientPlayer('B');
            playerC = new xss.room.ClientPlayer('C');
            players.add(playerA);
            players.add(playerB);
            players.add(playerC);
            game.updatePlayers(players);
        });

        it('Add three snakes', function() {
            expect(xss.shapes.SNK0).toEqual(jasmine.any(xss.Shape));
            expect(xss.shapes.SNK1).toEqual(jasmine.any(xss.Shape));
            expect(xss.shapes.SNK2).toEqual(jasmine.any(xss.Shape));
        });

        it('Removes snake shapes', function() {
            players.remove(playerB);
            game.updatePlayers(players);
            // Players A remains first snake.
            // Players C is now the second snake.
            expect(xss.shapes.SNK0).toBeTruthy();
            expect(xss.shapes.SNK1).toBeTruthy();
            expect(xss.shapes.SNK2).toBeNull();
        });

        // @TODO: Move to Snake tests
        it('Does not show crash particles', function() {
            var crashed = false;
            Object.keys(xss.shapes).forEach(function(key) {
                if (key.substr(0, 4) === 'EXPL' && xss.shapes[key]) {
                    crashed = true;
                }
            });
            expect(crashed).toBeFalsy();
        });
    });

});
});
