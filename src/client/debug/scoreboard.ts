import { Player } from "../../shared/room/player";
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
            new ChatMessage(null, "This is a notification"),
            new ChatMessage("Player 1", "Hello world"),
        ];
        const author = new Player("Dummy");
        new MessageBoxUI(messages, author, (body) => {
            console.log(body);
        });

        const players = new ClientPlayerRegistry();
        for (let i = 0, m = 5; i <= m; i++) {
            const player = new Player("Player " + (i + 1), true, i === 0);
            players.add(player);
        }
        const scoreboard = new Scoreboard(players);

        setTimeout(() => {
            // Mimic player leaving, joining during lobby.
            players.players[2].score = 1; // Player 3 leads.
            scoreboard.ui.updateScoreboard();

            setTimeout(() => {
                players.players[2].connected = false; // Player 3 leaves.
                scoreboard.ui.debounceUpdate();

                setTimeout(() => {
                    players.add(new Player("Player 6")); // Player 6 joins.
                    scoreboard.ui.debounceUpdate();
                }, 1000);
            }, 1000);
        }, 1000);

        // Mimic game.
        //function increase() {
        //    randomArrItem(players.players).score += randomRange(1, 3);
        //    scoreboard.ui.debounceUpdate();
        //    setTimeout(increase, randomRange(0, 500));
        //}
        //increase();
    }, 200);
}
