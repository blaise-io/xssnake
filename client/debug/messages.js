'use strict';

// Debug URL: client.html?debug=tab
xss.debug.messages = location.search.match(/debug=messages/);
if (xss.debug.messages) {
    xss.menuSnake = true; // Prevent spawn.
    setTimeout(function() {
        var messages = [];
        var ui = new xss.ui.MessageBox(messages);

        xss.shapes.stage = null;
        xss.shapes.innerBorder = xss.shapegen.innerBorder();

        function randomBody() {
            var body = [];
            for (var i = 0, m = xss.util.randomRange(1, 6); i < m; i++) {
                body.push(xss.util.randomStr(xss.util.randomRange(2, 7)));
            }
            return body.join(' ');
        }

        function addMessage() {
            messages.push(new xss.room.Message(xss.util.getRandomName(), randomBody()));
            ui.updateMessages();
            window.setTimeout(addMessage, xss.util.randomRange(0, 3000));
        }

        addMessage();

    }, 200);
}
