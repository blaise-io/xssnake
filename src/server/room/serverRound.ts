import { EventEmitter } from "events";
import { SECONDS_ROUND_COUNTDOWN } from "../../shared/const";
import { loadLevel } from "../../shared/level/level";
import { RoomManualStartMessage } from "../../shared/room/roomMessages";
import { RoomOptions } from "../../shared/room/roomOptions";
import { Round } from "../../shared/room/round";
import {
    RoundCountDownMessage as RoundCountDownMessage,
    RoundStartMessage,
    RoundWrapupMessage,
} from "../../shared/room/roundMessages";
import { SERVER_EVENT } from "../const";
import { ServerGame } from "../game/serverGame";
import { serverImageLoader } from "../level/serverImageLoader";
import { LevelsPlayed } from "../../shared/levelSet/levelsPlayed";
import { ServerPlayer } from "./serverPlayer";
import { ServerPlayerRegistry } from "./serverPlayerRegistry";

export class ServerRound extends Round {
    game?: ServerGame;
    wrappingUp = false;

    private _countDown = false;
    private countdownTimer?: NodeJS.Timeout;
    private onPlayerDisconnect = () => {
        this.countDown = false;
    };

    constructor(
        private readonly roomEmitter: EventEmitter,
        readonly players: ServerPlayerRegistry,
        readonly options: RoomOptions,
        private readonly levelPlayset: LevelsPlayed,
        private readonly roundsPlayed = 0,
    ) {
        super(players, options, levelPlayset.nextLevelIndex);

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

    unbindEvents(): void {
        this.roomEmitter.off(SERVER_EVENT.PLAYER_DISCONNECT, this.onPlayerDisconnect);
        this.roomEmitter.removeAllListeners(RoomManualStartMessage.id);
    }

    async startRound(): Promise<void> {
        this.unbindEvents();
        this.level = await loadLevel(this.LevelClass, serverImageLoader);
        this.game = new ServerGame(this.roomEmitter, this.level, this.players);
        this.players.send(new RoundStartMessage());
    }

    wrapUp(winnerPlayer: ServerPlayer): void {
        // TODO: Handle in Client?
        this.players.send(new RoundWrapupMessage(winnerPlayer.id));
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
        this.players.send(new RoundCountDownMessage(enabled, this.roundsPlayed));
        if (enabled) {
            this.countdownTimer = setTimeout(async () => {
                await this.startRound();
            }, SECONDS_ROUND_COUNTDOWN * 1000);
        }
    }
}
