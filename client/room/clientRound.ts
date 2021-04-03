import { NC_ROUND_COUNTDOWN, NC_ROUND_SERIALIZE, NC_ROUND_START, NC_ROUND_WRAPUP } from "../../shared/const";
import { BlankLevel } from "../../shared/levels/debug/blank";
import { Config } from "../../shared/levelset/config";
import { Options } from "../../shared/room/options";
import { Round } from "../../shared/room/round";
import { EV_PLAYERS_UPDATED, NS_ROUND } from "../const";
import { ClientGame } from "../game/clientGame";
import { State } from "../state/state";
import { PreGameUI } from "../ui/preGame";
import { WrapupGame } from "../ui/switchRound";
import { ClientPlayerRegistry } from "./clientPlayerRegistry";

export class ClientRound extends Round {
    private game: ClientGame;
    private preGameUI: any;
    private wrapupGameUI: WrapupGame;

    constructor(public players: ClientPlayerRegistry, public options: Options) {
        super(players, options);

        this.level = new BlankLevel(new Config());
        this.game = new ClientGame(this.level, this.players);

        this.preGameUI = new PreGameUI(players, options);
        this.wrapupGameUI = null;

        this.bindEvents();
    }

    destruct() {
        this.unbindEvents();
        this.game.destruct();
        this.game = null;
        if (this.preGameUI) {
            this.preGameUI.destruct();
            this.preGameUI = null;
        }
        if (this.wrapupGameUI) {
            this.wrapupGameUI.destruct();
            this.wrapupGameUI = null;
        }
    }

    bindEvents() {
        State.events.on(EV_PLAYERS_UPDATED, NS_ROUND, this.updatePlayers.bind(this));
        State.events.on(NC_ROUND_SERIALIZE, NS_ROUND, this.updateRound.bind(this));
        State.events.on(NC_ROUND_COUNTDOWN, NS_ROUND, this.updateCountdown.bind(this));
        State.events.on(NC_ROUND_START, NS_ROUND, this.startGame.bind(this));
        State.events.on(NC_ROUND_WRAPUP, NS_ROUND, this.wrapupGame.bind(this));
    }

    unbindEvents() {
        State.events.off(EV_PLAYERS_UPDATED, NS_ROUND);
        State.events.off(NC_ROUND_SERIALIZE, NS_ROUND);
        State.events.off(NC_ROUND_COUNTDOWN, NS_ROUND);
        State.events.off(NC_ROUND_START, NS_ROUND);
    }

    updatePlayers() {
        this.game.updatePlayers(this.players);
        this.preGameUI.updateUI();
    }

    updateRound(serializedRound) {
        this.deserialize(serializedRound);
        this.level = this.getLevel(this.levelsetIndex, this.levelIndex);
        this.game.updateLevel(this.level);
    }

    updateCountdown(serializedStarted) {
        this.preGameUI.toggleCountdown(Boolean(serializedStarted[0]));
        this.preGameUI.updateUI();
    }

    startGame() {
        this.unbindEvents();
        this.preGameUI.destruct();
        this.game.start();
    }

    wrapupGame(winnerIndex) {
        this.wrapupGameUI = new WrapupGame(
            this.players,
            this.players.players[winnerIndex] || null
        );
    }

    isMidgame() {
        return this.game.started;
    }

}
