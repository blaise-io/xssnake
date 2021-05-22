import { Player } from "../../shared/room/player";
import { PlayersMessage } from "../../shared/room/playerRegistry";
import { globalEventHandler } from "../util/eventHandler";
import { ClientPlayerRegistry } from "../room/clientPlayerRegistry";
import { ChatMessage } from "../room/chatMessage";
import { Scoreboard } from "../room/scoreboard";
import { State } from "../state";
import { innerBorder, outerBorder } from "../ui/clientShapeGenerator";
import { MessageBoxUI } from "../ui/messageBox";

export function debugScoreboard(): void {
    setTimeout(() => {
        State.flow.destruct();

        State.shapes.innerBorder = innerBorder();
        Object.assign(State.shapes, outerBorder());

        const messages = [
            new ChatMessage(undefined, "This is a notification"),
            new ChatMessage("Player 1", "Hello world"),
        ];
        const author = new Player(0, "Dummy");
        new MessageBoxUI(messages, author, (body) => {
            console.debug(body);
        });

        const players = new ClientPlayerRegistry();
        for (let i = 0, m = 5; i <= m; i++) {
            const player = new Player(i, "Player " + (i + 1), true, i === 0);
            players.push(player);
        }
        new Scoreboard(players);

        setTimeout(() => {
            // Mimic player leaving, joining during lobby.
            players[2].score = 1; // Player 3 leads.
            globalEventHandler.trigger(PlayersMessage.id, new PlayersMessage(players));

            setTimeout(() => {
                players[2].connected = false; // Player 3 leaves.
                globalEventHandler.trigger(PlayersMessage.id, new PlayersMessage(players));

                setTimeout(() => {
                    players.push(new Player(6, "Player 6")); // Player 6 joins.
                    globalEventHandler.trigger(PlayersMessage.id, new PlayersMessage(players));
                }, 1000);
            }, 1000);
        }, 1000);

        // Mimic game.
        //function increase() {
        //    randomArrItem(players).score += randomRange(1, 3);
        //    scoreboard.ui.debounceUpdate();
        //    setTimeout(increase, randomRange(0, 500));
        //}
        //increase();
    }, 200);
}
