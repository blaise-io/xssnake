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
        this.bindEvents();
    }

    destruct(): void {
        // delete this.players;
        this.ui.destruct();
        // delete this.ui;
        this.unbindEvents();
    }

    bindEvents(): void {
        State.events.on(PlayersMessage.id, NS.SCORE, () => {
            this.ui.debounceUpdate();
        });
        State.events.on(ScoreMessage.id, NS.SCORE, (message: ScoreMessage) => {
            this.players.setScores(message.score);
            this.ui.debounceUpdate();
        });
    }

    unbindEvents(): void {
        State.events.off(PlayersMessage.id, NS.SCORE);
        State.events.off(ScoreMessage.id, NS.SCORE);
    }
}
