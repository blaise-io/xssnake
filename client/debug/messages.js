'use strict';

// Debug URL: client.html?debug=tab
xss.debug.messages = location.search.match(/debug=messages/);
if (xss.debug.messages) {
    xss.menuSnake = true; // Prevent spawn.
    setTimeout(function() {
        var messages = [];
        var author = new xss.room.Player('Dummy');
        var ui = new xss.ui.MessageBox(messages, author);

        xss.flow.destruct();

        xss.shapes.innerBorder = xss.shapegen.innerBorder();
        xss.shapegen.outerBorder(function(a, b) {
            xss.shapes[a] = b;
        });

        var players = new xss.room.ClientPlayerRegistry();
        new xss.room.Scoreboard(players);

        function randomBody() {
            var body = [];
            for (var i = 0, m = xss.util.randomRange(1, 6); i < m; i++) {
                body.push(xss.util.randomStr(xss.util.randomRange(2, 7)));
            }
            return body.join(' ');
        }

        function addMessage() {
            messages.push(new xss.room.Message(xss.util.getRandomName(), randomBody()));
            ui.debounceUpdate();
            window.setTimeout(addMessage, xss.util.randomRange(0, 5000));
        }

        messages.push(new xss.room.Message(null, xss.COPY_CHAT_INSTRUCT));
        ui.debounceUpdate();
        addMessage();

    }, 200);
}
