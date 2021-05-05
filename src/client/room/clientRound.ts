import { NC_ROUND_COUNTDOWN, NC_ROUND_START, NC_ROUND_WRAPUP } from "../../shared/const";
import { NETCODE } from "../../shared/room/netcode";
import { RoomOptions } from "../../shared/room/roomOptions";
import { RoomRoundMessage, Round } from "../../shared/room/round";
import { EV_PLAYERS_UPDATED, NS } from "../const";
import { ClientGame } from "../game/clientGame";
import { State } from "../state";
import { PreGameUI } from "../ui/preGame";
import { WrapupGame } from "../ui/switchRound";
import { clientImageLoader } from "../util/clientUtil";
import { ClientPlayerRegistry } from "./clientPlayerRegistry";

export class ClientRound extends Round {
    game: ClientGame;
    private preGameUI: PreGameUI;
    private wrapupGameUI: WrapupGame = undefined;

    constructor(public players: ClientPlayerRegistry, public options: RoomOptions) {
        super(players, options);

        this.preGameUI = new PreGameUI(players, options);

        // this.setLevel(BlankLevel).then(() => {
        //     console.log("BLANK LEVEL SET");
        //     this.game = new ClientGame(this.level, this.players);
        //     this.bindEvents();
        // });
        this.bindEvents();
    }

    destruct(): void {
        this.unbindEvents();
        if (this.game) {
            this.game.destruct();
            delete this.game;
        }
        if (this.preGameUI) {
            this.preGameUI.destruct();
            this.preGameUI = undefined;
        }
        if (this.wrapupGameUI) {
            this.wrapupGameUI.destruct();
            this.wrapupGameUI = undefined;
        }
    }

    setLevel(levelSetIndex: number, levelIndex: number): Promise<void> {
        this.levelSetIndex = levelSetIndex;
        this.levelIndex = levelIndex;
        this.level = new this.LevelClass();
        return this.level.load(clientImageLoader).then(() => {
            if (this.game) {
                this.game.destruct();
            }
            this.game = new ClientGame(this.level, this.players);
        });
    }

    bindEvents(): void {
        State.events.on(EV_PLAYERS_UPDATED, NS.ROUND, this.updatePlayers.bind(this));
        State.events.on(NETCODE.ROUND_SERIALIZE, NS.ROUND, async (message: RoomRoundMessage) => {
            await this.setLevel(message.levelSetIndex, message.levelIndex);
        });
        State.events.on(NC_ROUND_COUNTDOWN, NS.ROUND, this.updateCountdown.bind(this));
        State.events.on(NC_ROUND_START, NS.ROUND, this.startGame.bind(this));
        State.events.on(NC_ROUND_WRAPUP, NS.ROUND, this.wrapupGame.bind(this));
    }

    unbindEvents(): void {
        State.events.off(EV_PLAYERS_UPDATED, NS.ROUND);
        State.events.off(NETCODE.ROUND_SERIALIZE, NS.ROUND);
        State.events.off(NC_ROUND_COUNTDOWN, NS.ROUND);
        State.events.off(NC_ROUND_START, NS.ROUND);
    }

    updatePlayers(): void {
        this.game.updatePlayers(this.players);
        this.preGameUI.updateUI();
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
        this.wrapupGameUI = new WrapupGame(this.players, this.players[winnerIndex] || null);
    }
}
