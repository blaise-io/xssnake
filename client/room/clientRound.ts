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
import { EV_PLAYERS_UPDATED, NS_ROUND } from "../const";
import { ClientGame } from "../game/clientGame";
import { ClientState } from "../state/clientState";
import { PreGameUI } from "../ui/preGame";
import { WrapupGame } from "../ui/switchRound";
import { clientImageLoader } from "../util/clientUtil";
import { ClientPlayerRegistry } from "./clientPlayerRegistry";

export class ClientRound extends Round {
    private game: ClientGame;
    private preGameUI: PreGameUI;
    private wrapupGameUI: WrapupGame = null;
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

    bindEvents(): void {
        ClientState.events.on(EV_PLAYERS_UPDATED, NS_ROUND, this.updatePlayers.bind(this));
        ClientState.events.on(NC_ROUND_SERIALIZE, NS_ROUND, this.updateRound.bind(this));
        ClientState.events.on(NC_ROUND_COUNTDOWN, NS_ROUND, this.updateCountdown.bind(this));
        ClientState.events.on(NC_ROUND_START, NS_ROUND, this.startGame.bind(this));
        ClientState.events.on(NC_ROUND_WRAPUP, NS_ROUND, this.wrapupGame.bind(this));
    }

    unbindEvents(): void {
        ClientState.events.off(EV_PLAYERS_UPDATED, NS_ROUND);
        ClientState.events.off(NC_ROUND_SERIALIZE, NS_ROUND);
        ClientState.events.off(NC_ROUND_COUNTDOWN, NS_ROUND);
        ClientState.events.off(NC_ROUND_START, NS_ROUND);
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
