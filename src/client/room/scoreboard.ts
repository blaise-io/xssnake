import { ScoreMessage } from "../../shared/game/scoreMessages";
import { PlayersMessage } from "../../shared/room/playerRegistry";
import { eventx } from "../netcode/eventHandler";
import { ScoreboardUI } from "../ui/scoreboard";
import { ClientPlayerRegistry } from "./clientPlayerRegistry";

export class Scoreboard {
    ui: ScoreboardUI;
    private eventContext = eventx.context;

    constructor(public players: ClientPlayerRegistry) {
        this.ui = new ScoreboardUI(players);

        this.eventContext.on(PlayersMessage.id, () => {
            this.ui.debounceUpdate();
        });

        this.eventContext.on(ScoreMessage.id, (message: ScoreMessage) => {
            message.score.forEach((score, index) => {
                this.players[index].score = score;
            });
            this.ui.debounceUpdate();
        });
    }

    destruct(): void {
        this.ui.destruct();
        this.eventContext.destruct();
    }
}
