import {
    NC_ROUND_COUNTDOWN,
    NC_ROUND_SERIALIZE,
    NC_ROUND_START,
    NC_ROUND_WRAPUP,
} from "../../shared/const";
import { Level } from "../../shared/level/level";
import { BlankLevel } from "../../shared/levels/debug/blank";
import { RoomOptions } from "../../shared/room/roomOptions";
import { Round } from "../../shared/room/round";
import { EV_PLAYERS_UPDATED, NS } from "../const";
import { ClientGame } from "../game/clientGame";
import { State } from "../state";
import { PreGameUI } from "../ui/preGame";
import { WrapupGame } from "../ui/switchRound";
import { clientImageLoader } from "../util/clientUtil";
import { ClientPlayerRegistry } from "./clientPlayerRegistry";

export class ClientRound extends Round {
    private game: ClientGame;
    private preGameUI: PreGameUI;
    private wrapupGameUI: WrapupGame = undefined;
    level: Level;

    constructor(public players: ClientPlayerRegistry, public options: RoomOptions) {
        super(players, options);

        this.preGameUI = new PreGameUI(players, options);

        this.level = new BlankLevel();
        this.level.load(clientImageLoader).then(() => {
            this.game = new ClientGame(this.level, this.players);
            this.bindEvents();
        });
    }

    destruct(): void {
        this.unbindEvents();
        this.game.destruct();
        this.game = undefined;
        if (this.preGameUI) {
            this.preGameUI.destruct();
            this.preGameUI = undefined;
        }
        if (this.wrapupGameUI) {
            this.wrapupGameUI.destruct();
            this.wrapupGameUI = undefined;
        }
    }

    bindEvents(): void {
        State.events.on(EV_PLAYERS_UPDATED, NS.ROUND, this.updatePlayers.bind(this));
        State.events.on(NC_ROUND_SERIALIZE, NS.ROUND, this.updateRound.bind(this));
        State.events.on(NC_ROUND_COUNTDOWN, NS.ROUND, this.updateCountdown.bind(this));
        State.events.on(NC_ROUND_START, NS.ROUND, this.startGame.bind(this));
        State.events.on(NC_ROUND_WRAPUP, NS.ROUND, this.wrapupGame.bind(this));
    }

    unbindEvents(): void {
        State.events.off(EV_PLAYERS_UPDATED, NS.ROUND);
        State.events.off(NC_ROUND_SERIALIZE, NS.ROUND);
        State.events.off(NC_ROUND_COUNTDOWN, NS.ROUND);
        State.events.off(NC_ROUND_START, NS.ROUND);
    }

    updatePlayers(): void {
        this.game.updatePlayers(this.players);
        this.preGameUI.updateUI();
    }

    updateRound(serializedRound: [number, number]): void {
        this.deserialize(serializedRound);
        const Level = this.getLevel(this.levelsetIndex, this.levelIndex);
        this.level = new Level();
        this.level.load(clientImageLoader).then(() => {
            this.game.updateLevel(this.level);
        });
    }

    updateCountdown(serializedStarted: [boolean]): void {
        this.preGameUI.toggleCountdown(Boolean(serializedStarted[0]));
        this.preGameUI.updateUI();
    }

    startGame(): void {
        this.unbindEvents();
        this.preGameUI.destruct();
        this.game.start();
    }

    wrapupGame(winnerIndex: number): void {
        this.wrapupGameUI = new WrapupGame(this.players, this.players.players[winnerIndex] || null);
    }

    isMidgame(): boolean {
        return this.game.started;
    }
}
