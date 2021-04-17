import { NC_PLAYERS_SERIALIZE, NC_SCORE_UPDATE } from "../../shared/const";
import { NS_SCORE } from "../const";
import { ClientState } from "../state/clientState";
import { ScoreboardUI } from "../ui/scoreboard";
import { ClientPlayerRegistry } from "./clientPlayerRegistry";

export class Scoreboard {
    ui: ScoreboardUI;
    players: ClientPlayerRegistry;

    constructor(players) {
        this.players = players;
        this.ui = new ScoreboardUI(players);
        this.bindEvents();
    }

    destruct() {
        this.players = null;
        this.ui.destruct();
        this.ui = null;
        this.unbindEvents();
    }

    bindEvents() {
        ClientState.events.on(NC_PLAYERS_SERIALIZE, NS_SCORE, this.ui.debounceUpdate.bind(this.ui));
        ClientState.events.on(NC_SCORE_UPDATE, NS_SCORE, this.updatePlayerScores.bind(this));
    }

    unbindEvents() {
        ClientState.events.off(NC_PLAYERS_SERIALIZE, NS_SCORE);
        ClientState.events.off(NC_SCORE_UPDATE, NS_SCORE);
    }

    updatePlayerScores(scoreArray) {
        this.players.setScores(scoreArray);
        this.ui.debounceUpdate();
    }
}
