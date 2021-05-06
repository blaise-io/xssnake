import { EventEmitter } from "events";
import { NC_ROOM_START, NC_ROUND_WRAPUP, SECONDS_ROUND_COUNTDOWN } from "../../shared/const";
import { RoomOptions } from "../../shared/room/roomOptions";
import {
    RoundCountdownMessage,
    RoomRoundMessage,
    Round,
    RoundStartMessage,
} from "../../shared/room/round";
import { ServerGame } from "../game/serverGame";
import { serverImageLoader } from "../level/serverImageLoader";
import { LevelPlayset } from "./playset";
import { ServerPlayer } from "./serverPlayer";
import { ServerPlayerRegistry } from "./serverPlayerRegistry";

export class ServerRound extends Round {
    private game: ServerGame;
    wrappingUp: boolean;
    private countdownStarted: boolean;
    private countdownTimer: NodeJS.Timeout;

    constructor(
        public roomEmitter: EventEmitter,
        public players: ServerPlayerRegistry,
        public options: RoomOptions,
        public levelPlayset: LevelPlayset,
    ) {
        super(players, options);

        this.levelSetIndex = options.levelSetIndex;
        this.levelIndex = levelPlayset.getNext();

        this.countdownStarted = false;
        this.wrappingUp = false;

        this.bindEvents();
    }

    destruct(): void {
        clearTimeout(this.countdownTimer);
        this.unbindEvents();

        if (this.game) {
            this.game.destruct();
            delete this.game;
        }

        if (this.level) {
            this.level.destruct();
            delete this.level;
        }

        delete this.roomEmitter;
    }

    bindEvents(): void {
        // this.roomEmitter.on(String(SE_PLAYER_DISCONNECT), "xx");
        this.roomEmitter.on(String(NC_ROOM_START), this.handleManualRoomStart.bind(this));
    }

    unbindEvents(): void {
        // this.roomEmitter.removeListener(String(SE_PLAYER_DISCONNECT), "xx");
        this.roomEmitter.removeAllListeners(String(NC_ROOM_START));
    }

    emit(player: ServerPlayer): void {
        player.send(RoomRoundMessage.fromRound(this));
    }

    emitAll(): void {
        this.players.send(RoomRoundMessage.fromRound(this));
    }

    getAlivePlayers(): ServerPlayer[] {
        return this.players.filter((player) => player.snake && !player.snake.crashed);
    }

    wrapUp(winner: ServerPlayer): void {
        const data = [this.players.indexOf(winner)];
        this.players.emit(NC_ROUND_WRAPUP, data);
        this.wrappingUp = true;
    }

    toggleCountdown(enabled: boolean): void {
        clearTimeout(this.countdownTimer);
        this.countdownStarted = enabled;
        this.players.send(new RoundCountdownMessage(enabled));
        if (enabled) {
            this.countdownTimer = setTimeout(() => {
                this.startRound();
            }, SECONDS_ROUND_COUNTDOWN * 1000);
        }
    }

    startRound(): void {
        this.unbindEvents();
        this.level = new this.LevelClass();
        this.level.load(serverImageLoader).then(() => {
            this.game = new ServerGame(this.roomEmitter, this.level, this.players);
            this.started = true;
            this.players.send(new RoundStartMessage());
        });
    }

    handleManualRoomStart(event: number, player: ServerPlayer): void {
        if (this.players.isHost(player) && !this.countdownTimer) {
            this.toggleCountdown(true);
        }
    }

    handleDisconnect(): void {
        if (this.countdownStarted) {
            this.toggleCountdown(false);
        }
    }
}
