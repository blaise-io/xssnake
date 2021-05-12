import { loadLevel } from "../../shared/level/level";
import { PlayersMessage } from "../../shared/room/playerRegistry";
import { RoomOptions } from "../../shared/room/roomOptions";
import { Round } from "../../shared/room/round";
import {
    RoundLevelMessage,
    RoundCountDownMessage,
    RoundStartMessage,
    RoundWrapupMessage,
} from "../../shared/room/roundMessages";
import { ClientGame } from "../game/clientGame";
import { eventx } from "../netcode/eventHandler";
import { PreGameUI } from "../ui/preGame";
import { WrapupGame } from "../ui/switchRound";
import { clientImageLoader } from "../util/clientUtil";
import { ClientPlayerRegistry } from "./clientPlayerRegistry";

export class ClientRound extends Round {
    game?: ClientGame;
    private preGameUI?: PreGameUI;
    private wrapupGameUI?: WrapupGame;
    private eventContext = eventx.context;

    constructor(
        public players: ClientPlayerRegistry,
        public options: RoomOptions,
        public levelIndex: number,
    ) {
        super(players, options, levelIndex);
        this.preGameUI = new PreGameUI(players, options);
        this.bindEvents();

        this.setLevel(this.levelIndex);
    }

    destruct(): void {
        this.eventContext.destruct();

        this.game?.destruct();
        delete this.game;

        this.preGameUI?.destruct();
        delete this.preGameUI;

        this.wrapupGameUI?.destruct();
        delete this.wrapupGameUI;
    }

    async setLevel(levelIndex: number): Promise<void> {
        this.levelIndex = levelIndex;

        this.game?.destruct();
        this.level = await loadLevel(this.LevelClass, clientImageLoader);
        this.game = new ClientGame(this.level, this.players);
    }

    bindEvents(): void {
        this.eventContext.on(PlayersMessage.id, async () => {
            this.preGameUI?.updateUI();
            await this.setLevel(this.levelIndex);
        });
        this.eventContext.on(RoundLevelMessage.id, async (message: RoundLevelMessage) => {
            await this.setLevel(message.levelIndex);
        });
        this.eventContext.on(RoundCountDownMessage.id, (message: RoundCountDownMessage) => {
            this.preGameUI?.toggleCountdown(message.enabled);
            this.preGameUI?.updateUI();
        });
        this.eventContext.on(RoundStartMessage.id, () => {
            this.eventContext.destruct();
            this.preGameUI?.destruct();
            this.game?.start();
            delete this.preGameUI;
        });
        this.eventContext.on(RoundWrapupMessage.id, (message: RoundWrapupMessage) => {
            this.wrapupGameUI = new WrapupGame(
                this.players,
                this.players[message.winningPlayerIndex],
            );
        });
    }
}
