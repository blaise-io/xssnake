// Debug URL: client.html?debug=tab
import { Player } from "../../shared/room/player";
import { getRandomName, randomRange, randomStr } from "../../shared/util";
import { COPY_CHAT_INSTRUCT } from "../copy/copy";
import { ClientPlayerRegistry } from "../room/clientPlayerRegistry";
import { Message } from "../room/message";
import { Scoreboard } from "../room/scoreboard";
import { NeuteredMenuSnake } from "../stage/menuSnake";
import { ClientState } from "../state/clientState";
import { innerBorder, outerBorder } from "../ui/clientShapeGenerator";
import { MessageBoxUI } from "../ui/messageBox";

if (location.search.match(/debug=messages/)) {
    ClientState.menuSnake = new NeuteredMenuSnake();
    setTimeout(function () {
        const messages = [];
        const author = new Player("Dummy");
        const ui = new MessageBoxUI(messages, author);

        ClientState.flow.destruct();

        ClientState.shapes.innerBorder = innerBorder();
        Object.assign(ClientState.shapes, outerBorder());

        const players = new ClientPlayerRegistry();
        new Scoreboard(players);

        function randomBody() {
            const body = [];
            for (let i = 0, m = randomRange(1, 6); i < m; i++) {
                body.push(randomStr(randomRange(2, 7)));
            }
            return body.join(" ");
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
