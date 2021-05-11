import { loadLevel } from "../../shared/level/level";
import { RoomOptions } from "../../shared/room/roomOptions";
import { Round } from "../../shared/room/round";
import {
    RoundLevelMessage,
    RoundCountDownMessage,
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
    game?: ClientGame;
    private preGameUI?: PreGameUI;
    private wrapupGameUI?: WrapupGame;

    constructor(
        public players: ClientPlayerRegistry,
        public options: RoomOptions,
        public levelIndex: number,
    ) {
        super(players, options, levelIndex);
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

    async setLevel(levelIndex: number): Promise<void> {
        this.levelIndex = levelIndex;

        this.game?.destruct();
        this.level = await loadLevel(this.LevelClass, clientImageLoader);
        this.game = new ClientGame(this.level, this.players);
    }

    bindEvents(): void {
        State.events.on(EV_PLAYERS_UPDATED, NS.ROUND, async () => {
            this.preGameUI?.updateUI();
            await this.setLevel(this.levelIndex);
        });
        State.events.on(RoundLevelMessage.id, NS.ROUND, async (message: RoundLevelMessage) => {
            await this.setLevel(message.levelIndex);
        });
        State.events.on(RoundCountDownMessage.id, NS.ROUND, (message: RoundCountDownMessage) => {
            this.preGameUI?.toggleCountdown(message.enabled);
            this.preGameUI?.updateUI();
        });
        State.events.on(RoundStartMessage.id, NS.ROUND, () => {
            this.unbindEvents();
            this.preGameUI?.destruct();
            this.game?.start();
            delete this.preGameUI;
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
        State.events.off(RoundLevelMessage.id, NS.ROUND);
        State.events.off(RoundCountDownMessage.id, NS.ROUND);
        State.events.off(RoundStartMessage.id, NS.ROUND);
        State.events.off(RoundWrapupMessage.id, NS.ROUND);
    }
}
