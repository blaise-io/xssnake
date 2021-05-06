import { NC_SCORE_UPDATE } from "../../shared/const";
import { RoomPlayersMessage } from "../../shared/room/playerRegistry";
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
        delete this.players;
        this.ui.destruct();
        delete this.ui;
        this.unbindEvents();
    }

    bindEvents(): void {
        State.events.on(RoomPlayersMessage.id, NS.SCORE, (message: RoomPlayersMessage) => {
            this.ui.debounceUpdate();
        });
        State.events.on(NC_SCORE_UPDATE, NS.SCORE, this.updatePlayerScores.bind(this));
    }

    unbindEvents(): void {
        State.events.off(RoomPlayersMessage.id, NS.SCORE);
        State.events.off(NC_SCORE_UPDATE, NS.SCORE);
    }

    updatePlayerScores(scoreArray: number[]): void {
        this.players.setScores(scoreArray);
        this.ui.debounceUpdate();
    }
}
