import { ScoreMessage } from "../../shared/game/scoreMessages";
import { SpawnHitMessage } from "../../shared/level/spawnables";
import { PlayersMessage } from "../../shared/room/playerRegistry";
import { EventHandler } from "../netcode/eventHandler";
import { ScoreboardUI } from "../ui/scoreboard";
import { ClientPlayerRegistry } from "./clientPlayerRegistry";

export class Scoreboard {
    private ui: ScoreboardUI;
    private eventHandler = new EventHandler();

    constructor(public players: ClientPlayerRegistry) {
        this.ui = new ScoreboardUI(players);

        this.eventHandler.on(PlayersMessage.id, () => {
            this.ui.debounceUpdate();
        });

        this.eventHandler.on(SpawnHitMessage.id, () => {
            this.ui.debounceUpdate();
        });

        this.eventHandler.on(ScoreMessage.id, (message: ScoreMessage) => {
            message.score.forEach((score, index) => {
                this.players[index].score = score;
            });
            this.ui.debounceUpdate();
        });
    }

    destruct(): void {
        this.ui.destruct();
        this.eventHandler.destruct();
    }
}
