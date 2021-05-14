import { EventEmitter } from "events";
import { SECONDS_ROUND_COUNTDOWN, SERVER_EVENT } from "../../shared/const";
import { loadLevel } from "../../shared/level/level";
import { RoomManualStartMessage } from "../../shared/room/roomMessages";
import { RoomOptions } from "../../shared/room/roomOptions";
import { Round } from "../../shared/room/round";
import {
    RoundCountDownMessage as RoundCountDownMessage,
    RoundStartMessage,
    RoundWrapupMessage,
} from "../../shared/room/roundMessages";
import { ServerGame } from "../game/serverGame";
import { serverImageLoader } from "../level/serverImageLoader";
import { LevelPlayset } from "./playset";
import { ServerPlayer } from "./serverPlayer";
import { ServerPlayerRegistry } from "./serverPlayerRegistry";

export class ServerRound extends Round {
    game?: ServerGame;
    wrappingUp = false;
    private _countDown = false;
    private countdownTimer?: NodeJS.Timeout;
    private onPlayerDisconnect: () => void;

    constructor(
        public roomEmitter: EventEmitter,
        public players: ServerPlayerRegistry,
        public options: RoomOptions,
        public levelPlayset: LevelPlayset,
    ) {
        super(players, options, levelPlayset.nextLevelIndex);

        this.onPlayerDisconnect = () => {
            this.countDown = false;
        };

        this.roomEmitter.on(SERVER_EVENT.PLAYER_DISCONNECT, this.onPlayerDisconnect);
        this.roomEmitter.on(RoomManualStartMessage.id, (player: ServerPlayer) => {
            if (this.players.isHost(player) && !this.countdownTimer) {
                this.countDown = true;
            }
        });
    }

    destruct(): void {
        this.unbindEvents();

        if (this.countdownTimer) {
            clearTimeout(this.countdownTimer);
        }

        this.game?.destruct();
        delete this.game;

        this.level?.destruct();
        delete this.level;
    }

    async startRound(): Promise<void> {
        this.unbindEvents();
        this.level = await loadLevel(this.LevelClass, serverImageLoader);
        this.game = new ServerGame(this.roomEmitter, this.level, this.players);
        this.players.send(new RoundStartMessage());
    }

    unbindEvents(): void {
        this.roomEmitter.off(SERVER_EVENT.PLAYER_DISCONNECT, this.onPlayerDisconnect);
        this.roomEmitter.removeAllListeners(RoomManualStartMessage.id);
    }

    wrapUp(winnerPlayer: ServerPlayer): void {
        this.players.send(new RoundWrapupMessage(this.players.indexOf(winnerPlayer)));
        this.wrappingUp = true;
    }

    start(): void {
        this.countDown = true;
    }

    set countDown(enabled: boolean) {
        if (this._countDown === enabled) {
            return;
        }
        if (this.countdownTimer) {
            clearTimeout(this.countdownTimer);
        }
        this._countDown = enabled;
        this.players.send(new RoundCountDownMessage(enabled));
        if (enabled) {
            this.countdownTimer = setTimeout(async () => {
                await this.startRound();
            }, SECONDS_ROUND_COUNTDOWN * 1000);
        }
    }
}
