// Debug URL: client.html?debug=tab
import { Player } from "../../shared/room/player";
import { getRandomName, randomRange, randomStr } from "../../shared/util";
import { COPY_CHAT_INSTRUCT } from "../copy/copy";
import { ClientPlayerRegistry } from "../room/clientPlayerRegistry";
import { Message } from "../room/message";
import { Scoreboard } from "../room/scoreboard";
import { State } from "../state/state";
import { innerBorder, outerBorder } from "../ui/clientShapes";

if (location.search.match(/debug=messages/)) {
    State.menuSnake = true; // Prevent spawn.
    setTimeout(function() {
        var messages = [];
        var author = new Player('Dummy');
        var ui = new ui.MessageBox(messages, author);

        State.flow.destruct();

        State.shapes.innerBorder = innerBorder();
        outerBorder(function(a, b) {
            State.shapes[a] = b;
        });

        var players = new ClientPlayerRegistry();
        new Scoreboard(players);

        function randomBody() {
            var body = [];
            for (var i = 0, m = randomRange(1, 6); i < m; i++) {
                body.push(randomStr(randomRange(2, 7)));
            }
            return body.join(' ');
        }

        function addMessage() {
            messages.push(new Message(getRandomName(), randomBody()));
            ui.debounceUpdate();
            window.setTimeout(addMessage, randomRange(0, 5000));
        }

        messages.push(new Message(null, COPY_CHAT_INSTRUCT));
        ui.debounceUpdate();
        addMessage();

    }, 200);
}
