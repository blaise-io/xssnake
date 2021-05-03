import { NC_PLAYERS_SERIALIZE, NC_SCORE_UPDATE } from "../../shared/const";
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
        this.players = undefined;
        this.ui.destruct();
        this.ui = undefined;
        this.unbindEvents();
    }

    bindEvents(): void {
        State.events.on(NC_PLAYERS_SERIALIZE, NS.SCORE, this.ui.debounceUpdate.bind(this.ui));
        State.events.on(NC_SCORE_UPDATE, NS.SCORE, this.updatePlayerScores.bind(this));
    }

    unbindEvents(): void {
        State.events.off(NC_PLAYERS_SERIALIZE, NS.SCORE);
        State.events.off(NC_SCORE_UPDATE, NS.SCORE);
    }

    updatePlayerScores(scoreArray: number[]): void {
        this.players.setScores(scoreArray);
        this.ui.debounceUpdate();
    }
}
