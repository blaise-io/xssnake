import { EventEmitter } from "events";
import { SE_PLAYER_COLLISION, SECONDS_ROUND_GLOAT, SECONDS_ROUND_PAUSE } from "../../shared/const";
import { RoomOptions } from "../../shared/room/roomOptions";
import { RoundLevelMessage } from "../../shared/room/roundMessages";
import { ServerScore } from "../game/serverScore";
import { LevelPlayset } from "./playset";
import { ServerPlayer } from "./serverPlayer";
import { ServerPlayerRegistry } from "./serverPlayerRegistry";
import { ServerRound } from "./serverRound";

/**
 * A set of rounds.
 * After minRoundsets rounds, the player with most points wins.
 */
export class ServerRoundSet {
    private levelPlayset: LevelPlayset;
    round: ServerRound;
    private score: ServerScore;
    private roundIndex = 0;
    private minRoundsets = 3;
    private minPointsDiff = 1;
    private nextRoundTimeout?: NodeJS.Timeout;

    constructor(
        public roomEmitter: EventEmitter,
        public players: ServerPlayerRegistry,
        public options: RoomOptions,
    ) {
        this.levelPlayset = new LevelPlayset(options.levelSetIndex);
        this.round = new ServerRound(roomEmitter, players, options, this.levelPlayset);
        this.score = new ServerScore(players);

        // TODO: this.round.game should emit a winner.
        this.roomEmitter.on(String(SE_PLAYER_COLLISION), this.handleCollisions.bind(this));
    }

    destruct(): void {
        this.score.destruct();
        this.round.destruct();
        this.levelPlayset.destruct();
        this.roomEmitter.removeAllListeners(String(SE_PLAYER_COLLISION));
        if (this.nextRoundTimeout) {
            clearTimeout(this.nextRoundTimeout);
        }
    }

    get started(): boolean {
        return this.roundIndex >= 1 || !!this.round.game;
    }

    private startNewRound(): void {
        this.round.destruct();
        this.round = new ServerRound(
            this.roomEmitter,
            this.players,
            this.options,
            this.levelPlayset,
        );
        this.players.send(RoundLevelMessage.fromRound(this.round));
        this.players.removeDisconnectedPlayers();
        this.round.start();
    }

    private switchRounds(winner: ServerPlayer): void {
        if (this.roundSetWinner) {
            // TODO: Fire XSS, gloat, spawn a boatload of apples, then restart rounds.
        } else if (!this.round.wrappingUp) {
            const delay = winner ? SECONDS_ROUND_GLOAT : SECONDS_ROUND_PAUSE;
            this.round.wrapUp(winner);
            this.nextRoundTimeout = setTimeout(this.startNewRound.bind(this), delay * 1000);
        }
    }

    private get roundSetWinner(): ServerPlayer | undefined {
        if (this.roundIndex + 1 < this.minRoundsets) {
            return;
        }
        return this.score.getWinner(this.minPointsDiff);
    }

    private handleCollisions(crashingPlayers: ServerPlayer[]): void {
        if (this.round.level) {
            const alive = this.round.getAlivePlayers();
            this.score.update(crashingPlayers, this.round.level);
            if (alive.length <= 1) {
                this.switchRounds(alive[0] || null);
            }
        }
    }

    detectAutostart(full: boolean): void {
        if (full && 0 === this.roundIndex) {
            this.round.start();
        }
    }
}
