import { RoomOptions } from "../../shared/room/roomOptions";
import { Round } from "../../shared/room/round";
import {
    RoomRoundMessage,
    RoundCountdownMessage,
    RoundStartMessage,
    RoundWrapupMessage,
} from "../../shared/room/roundMessages";
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
    private wrapupGameUI: WrapupGame;

    constructor(public players: ClientPlayerRegistry, public options: RoomOptions) {
        super(players, options);
        this.preGameUI = new PreGameUI(players, options);
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
            delete this.preGameUI;
        }
        if (this.wrapupGameUI) {
            this.wrapupGameUI.destruct();
            delete this.wrapupGameUI;
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
        State.events.on(RoomRoundMessage.id, NS.ROUND, async (message: RoomRoundMessage) => {
            await this.setLevel(message.levelSetIndex, message.levelIndex);
        });
        State.events.on(RoundCountdownMessage.id, NS.ROUND, (message: RoundCountdownMessage) => {
            this.preGameUI.toggleCountdown(message.enabled);
            this.preGameUI.updateUI();
        });
        State.events.on(RoundStartMessage.id, NS.ROUND, () => {
            this.unbindEvents();
            this.preGameUI.destruct();
            this.game.start();
        });
        State.events.on(RoundWrapupMessage.id, NS.ROUND, (message: RoundWrapupMessage) => {
            this.wrapupGameUI = new WrapupGame(
                this.players,
                this.players[message.winningPlayerIndex],
            );
        });
    }

    unbindEvents(): void {
        State.events.off(EV_PLAYERS_UPDATED, NS.ROUND);
        State.events.off(RoomRoundMessage.id, NS.ROUND);
        State.events.off(RoundCountdownMessage.id, NS.ROUND);
        State.events.off(RoundStartMessage.id, NS.ROUND);
        State.events.off(RoundWrapupMessage.id, NS.ROUND);
    }

    updatePlayers(): void {
        if (this.game) {
            this.game.updatePlayers(this.players);
        }
        this.preGameUI.updateUI();
    }
}
