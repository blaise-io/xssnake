import { EventEmitter } from "events";
import {
    NC_ROOM_START,
    NC_ROUND_COUNTDOWN,
    NC_ROUND_SERIALIZE,
    NC_ROUND_START,
    NC_ROUND_WRAPUP,
    SE_PLAYER_DISCONNECT,
    SECONDS_ROUND_COUNTDOWN,
} from "../../shared/const";
import { levelsets } from "../../shared/data/levelsets";
import { RoomOptions } from "../../shared/room/roomOptions";
import { Round } from "../../shared/room/round";
import { ServerGame } from "../game/serverGame";
import { serverImageLoader } from "../level/serverImageLoader";
import { LevelPlayset } from "./playset";
import { ServerPlayer } from "./serverPlayer";
import { ServerPlayerRegistry } from "./serverPlayerRegistry";

export class ServerRound extends Round {
    private game: ServerGame;
    wrappingUp: boolean;
    private countdownStarted: boolean;
    private handleDisconnectBound: (...args: any[]) => void;
    private countdownTimer: NodeJS.Timeout;

    constructor(
        public roomEmitter: EventEmitter,
        public players: ServerPlayerRegistry,
        public options: RoomOptions,
        public levelPlayset: LevelPlayset
    ) {
        super(players, options);

        this.levelsetIndex = options.levelset;
        this.levelset = levelsets[this.levelsetIndex];
        this.levelIndex = levelPlayset.getNext();

        this.countdownStarted = false;
        this.wrappingUp = false;

        this.handleDisconnectBound = this.handleDisconnect.bind(this);

        this.bindEvents();
    }

    destruct() {
        clearTimeout(this.countdownTimer);
        this.unbindEvents();

        if (this.game) {
            this.game.destruct();
            this.game = null;
        }

        if (this.level) {
            this.level.destruct();
            this.level = null;
        }

        this.handleDisconnectBound = null;
        this.roomEmitter = null;
        this.levelset = null;
    }

    bindEvents(): void {
        this.roomEmitter.on(String(SE_PLAYER_DISCONNECT), this.handleDisconnectBound);
        this.roomEmitter.on(String(NC_ROOM_START), this.handleManualRoomStart.bind(this));
    }

    unbindEvents(): void {
        this.roomEmitter.removeListener(String(SE_PLAYER_DISCONNECT), this.handleDisconnectBound);
        this.roomEmitter.removeAllListeners(String(NC_ROOM_START));
    }

    emit(player: ServerPlayer): void {
        player.emit(NC_ROUND_SERIALIZE, this.serialize());
    }

    emitAll(): void {
        this.players.emit(NC_ROUND_SERIALIZE, this.serialize());
    }

    getAlivePlayers(): ServerPlayer[] {
        return this.players.players.filter((player) => !player.snake.crashed);
    }

    wrapUp(winner: ServerPlayer): void {
        const data = [this.players.players.indexOf(winner)];
        this.players.emit(NC_ROUND_WRAPUP, data);
        this.wrappingUp = true;
    }

    toggleCountdown(enabled: boolean): void {
        clearTimeout(this.countdownTimer);
        this.countdownStarted = enabled;
        this.players.emit(NC_ROUND_COUNTDOWN, [+enabled]);

        if (enabled) {
            this.countdownTimer = setTimeout(
                this.startRound.bind(this),
                SECONDS_ROUND_COUNTDOWN * 1000
            );
        }
    }

    startRound(): void {
        this.unbindEvents();
        const Level = this.getLevel(this.levelsetIndex, this.levelIndex);
        this.level = new Level();
        this.level.load(serverImageLoader).then(() => {
            this.game = new ServerGame(this.roomEmitter, this.level, this.players);
            this.started = true;
            this.players.emit(NC_ROUND_START);
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
