import { Player } from "../../shared/room/player";
import { ClientPlayer } from "../room/clientPlayer";
import { ClientPlayerRegistry } from "../room/clientPlayerRegistry";
import { Message } from "../room/message";
import { Scoreboard } from "../room/scoreboard";
import { State } from "../state";
import { innerBorder, outerBorder } from "../ui/clientShapeGenerator";
import { MessageBoxUI } from "../ui/messageBox";

export function debugScoreboard(): void {
    setTimeout(function () {
        State.flow.destruct();

        State.shapes.innerBorder = innerBorder();
        Object.assign(State.shapes, outerBorder());

        const messages = [
            new Message(null, "This is a notification"),
            new Message("Player 1", "Hello world"),
        ];
        const author = new Player("Dummy");
        new MessageBoxUI(messages, author, (body) => {
            console.log(body);
        });

        const players = new ClientPlayerRegistry(new ClientPlayer("Blaise", true));
        for (let i = 0, m = 5; i <= m; i++) {
            const player = new Player("Player " + (i + 1));
            players.add(player);
        }
        const scoreboard = new Scoreboard(players);

        // Mimic player leaving, joining during lobby.
        players.players[2].score = 1; // Player 3 leads.
        scoreboard.ui.updateScoreboard();
        players.players.splice(2, 1); // PLayer 3 leaves.
        scoreboard.ui.debounceUpdate();
        setTimeout(function () {
            players.add(new Player("Player 6")); // Player 6 joins.
            scoreboard.ui.debounceUpdate();
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
