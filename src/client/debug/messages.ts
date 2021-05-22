import { Player } from "../../shared/room/player";
import { getRandomName, noop, randomRange, randomStr } from "../../shared/util";
import { ClientPlayerRegistry } from "../room/clientPlayerRegistry";
import { ChatMessage } from "../room/chatMessage";
import { Scoreboard } from "../room/scoreboard";
import { State } from "../state";
import { innerBorder, outerBorder } from "../ui/clientShapeGenerator";
import { MessageBoxUI } from "../ui/messageBox";

export function debugMessages(): void {
    setTimeout(function () {
        const messages: ChatMessage[] = [];
        const author = new Player(0, "Dummy");
        const ui = new MessageBoxUI(messages, author, noop);

        State.flow.destruct();

        State.shapes.innerBorder = innerBorder();
        Object.assign(State.shapes, outerBorder());

        const players = new ClientPlayerRegistry(new Player(1, "Blaise", true));
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

        messages.push(new ChatMessage(undefined, "First msg"));
        ui.debounceUpdate();
        addMessage();
    }, 200);
}
