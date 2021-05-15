import { EventEmitter } from "events";
import { SECONDS_ROUND_GLOAT, SECONDS_ROUND_PAUSE } from "../../shared/const";
import { RoomOptions } from "../../shared/room/roomOptions";
import { RoundLevelMessage } from "../../shared/room/roundMessages";
import { SERVER_EVENT } from "../const";
import { ServerScore } from "../game/serverScore";
import { LevelPlayset } from "./playset";
import { ServerPlayer } from "./serverPlayer";
import { ServerPlayerRegistry } from "./serverPlayerRegistry";
import { ServerRound } from "./serverRound";

/**
 * A set of rounds.
 * After minRoundSets rounds, the player with most points wins.
 */
export class ServerRoundSet {
    round: ServerRound;
    roundsPlayed = 0;

    private levelPlayset: LevelPlayset;
    private score: ServerScore;
    private minRoundsets = 3;
    private minPointsDiff = 1;
    private nextRoundTimeout?: NodeJS.Timeout;

    constructor(
        readonly roomEmitter: EventEmitter,
        readonly players: ServerPlayerRegistry,
        readonly options: RoomOptions,
    ) {
        this.levelPlayset = new LevelPlayset(options.levelSetIndex);
        this.round = new ServerRound(roomEmitter, players, options, this.levelPlayset);
        this.score = new ServerScore(players);
    }

    destruct(): void {
        this.score.destruct();
        this.round.destruct();
        this.levelPlayset.destruct();
        if (this.nextRoundTimeout) {
            clearTimeout(this.nextRoundTimeout);
        }
    }

    get started(): boolean {
        return this.roundsPlayed >= 1 || !!this.round.game;
    }

    private startNewRound(): void {
        this.round.destruct();
        this.roomEmitter.emit(SERVER_EVENT.ROUND_END);
        this.roundsPlayed++;
        this.round = new ServerRound(
            this.roomEmitter,
            this.players,
            this.options,
            this.levelPlayset,
        );
        this.players.send(RoundLevelMessage.fromRound(this.round));
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
        if (this.roundsPlayed + 1 < this.minRoundsets) {
            return;
        }
        return this.score.getRoundSetWinner(this.minPointsDiff);
    }

    // private handleCollisions(crashingSnakes: ServerSnake[]): void {
    //     if (this.round.level) {
    //         const alive = this.round.getAlivePlayers();
    //         this.score.update(crashingSnakes, this.round.level);
    //         if (alive.length <= 1) {
    //             this.switchRounds(alive[0] || null);
    //         }
    //     }
    // }

    start(): void {
        this.round.start();
    }
}
