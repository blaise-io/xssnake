import { ScoreMessage } from "../../shared/game/scoreMessages";
import { PlayersMessage } from "../../shared/room/playerRegistry";
import { NS } from "../const";
import { State } from "../state";
import { ScoreboardUI } from "../ui/scoreboard";
import { ClientPlayerRegistry } from "./clientPlayerRegistry";

export class Scoreboard {
    ui: ScoreboardUI;

    constructor(public players: ClientPlayerRegistry) {
        this.ui = new ScoreboardUI(players);

        State.events.on(PlayersMessage.id, NS.SCORE, () => {
            this.ui.debounceUpdate();
        });

        State.events.on(ScoreMessage.id, NS.SCORE, (message: ScoreMessage) => {
            message.score.forEach((score, index) => {
                this.players[index].score = score;
            });
            this.ui.debounceUpdate();
        });
    }

    destruct(): void {
        this.ui.destruct();
        State.events.off(PlayersMessage.id, NS.SCORE);
        State.events.off(ScoreMessage.id, NS.SCORE);
    }
}
