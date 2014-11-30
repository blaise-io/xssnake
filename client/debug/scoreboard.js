'use strict';

// Debug URL: client.html?debug=tab
xss.debug.messages = location.search.match(/debug=scoreboard/);
if (xss.debug.messages) {
    xss.menuSnake = true; // Prevent spawn.
    setTimeout(function() {

        xss.flow.destruct();

        xss.shapes.innerBorder = xss.shapegen.innerBorder();
        xss.shapegen.outerBorder(function(a, b) {
            xss.shapes[a] = b;
        });

        var messages = [
            new xss.room.Message(null, 'This is a notification'),
            new xss.room.Message('Player 1', 'Hello world')
        ];
        var author = new xss.room.Player('Dummy');
        new xss.ui.MessageBox(messages, author);

        var players = new xss.room.ClientPlayerRegistry();
        for (var i = 0, m = 5; i < m; i++) {
            var player = new xss.room.Player('Player ' + (i+1));
            if (i === 0) {
                player.local = true;
            }
            players.add(player);
        }
        var scoreboard = new xss.room.Scoreboard(players);

        // Mimic player leaving, joining during lobby.
        players.players[2].score = 1; // Player 3 leads.
        scoreboard.ui.updateScoreboard();
        players.players.splice(2, 1); // PLayer 3 leaves.
        scoreboard.ui.debounceUpdate();
        setTimeout(function() {
            players.add(new xss.room.Player('Player 6')); // Player 6 joins.
            scoreboard.ui.debounceUpdate();
        }, 1000);

        // Mimic game.
        //function increase() {
        //    xss.util.randomArrItem(players.players).score += xss.util.randomRange(1, 3);
        //    scoreboard.ui.debounceUpdate();
        //    setTimeout(increase, xss.util.randomRange(0, 500));
        //}
        //increase();

    }, 200);
}
