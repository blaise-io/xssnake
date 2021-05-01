import { Player } from "../../shared/room/player";
import { getRandomName, noop, randomRange, randomStr } from "../../shared/util";
import { COPY_CHAT_INSTRUCT } from "../copy/copy";
import { ClientPlayer } from "../room/clientPlayer";
import { ClientPlayerRegistry } from "../room/clientPlayerRegistry";
import { ChatMessage } from "../room/chatMessage";
import { Scoreboard } from "../room/scoreboard";
import { State } from "../state";
import { innerBorder, outerBorder } from "../ui/clientShapeGenerator";
import { MessageBoxUI } from "../ui/messageBox";

export function debugMessages(): void {
    setTimeout(function () {
        const messages = [];
        const author = new Player("Dummy");
        const ui = new MessageBoxUI(messages, author, noop);

        State.flow.destruct();

        State.shapes.innerBorder = innerBorder();
        Object.assign(State.shapes, outerBorder());

        const players = new ClientPlayerRegistry(new ClientPlayer("Blaise", true));
        new Scoreboard(players);

        function randomBody() {
            const body = [];
            for (let i = 0, m = randomRange(1, 6); i < m; i++) {
                body.push(randomStr(randomRange(2, 7)));
            }
            return body.join(" ");
        }

        function addMessage() {
            messages.push(new ChatMessage(getRandomName(), randomBody()));
            ui.debounceUpdate();
            window.setTimeout(addMessage, randomRange(0, 5000));
        }

        messages.push(new ChatMessage(null, COPY_CHAT_INSTRUCT));
        ui.debounceUpdate();
        addMessage();
    }, 200);
}
