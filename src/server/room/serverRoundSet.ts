/**
 * A set of rounds.
 * After N rounds, the player with most points wins.
 */
import { EventEmitter } from "events";
import { SE_PLAYER_COLLISION, SECONDS_ROUND_GLOAT, SECONDS_ROUND_PAUSE } from "../../shared/const";
import { RoomOptions } from "../../shared/room/roomOptions";
import { ServerScore } from "../game/serverScore";
import { LevelPlayset } from "./playset";
import { ServerPlayer } from "./serverPlayer";
import { ServerPlayerRegistry } from "./serverPlayerRegistry";
import { ServerRound } from "./serverRound";

export class ServerRoundSet {
    private levelPlayset: LevelPlayset;
    round: ServerRound;
    private score: ServerScore;
    private roundIndex = 0;
    private nextRoundTimeout: NodeJS.Timeout;
    constructor(
        public roomEmitter: EventEmitter,
        public players: ServerPlayerRegistry,
        public options: RoomOptions,
    ) {
        this.levelPlayset = new LevelPlayset(options.levelSetIndex);
        this.round = new ServerRound(roomEmitter, players, options, this.levelPlayset);
        this.score = new ServerScore(players);

        this.bindEvents();
    }

    destruct() {
        this.roomEmitter.removeAllListeners(String(SE_PLAYER_COLLISION));
        clearTimeout(this.nextRoundTimeout);

        this.levelPlayset.destruct();
        this.levelPlayset = undefined;

        this.round.destruct();
        this.round = undefined;

        this.score.destruct();
        this.score = undefined;

        this.players = undefined;
        this.options = undefined;
    }

    bindEvents() {
        this.roomEmitter.on(String(SE_PLAYER_COLLISION), this.handleCollisions.bind(this));
    }

    switchRounds(winner: ServerPlayer): void {
        const delay = winner ? SECONDS_ROUND_GLOAT : SECONDS_ROUND_PAUSE;
        if (this.hasSetWinner()) {
            // TODO
        } else if (!this.round.wrappingUp) {
            this.round.wrapUp(winner);
            this.nextRoundTimeout = setTimeout(this.startNewRound.bind(this), delay * 1000);
        }
    }

    startNewRound() {
        this.round.destruct();
        this.round = new ServerRound(
            this.roomEmitter,
            this.players,
            this.options,
            this.levelPlayset,
        );
        this.round.emitAll();
        this.players.removeDisconnectedPlayers();
        this.round.toggleCountdown(true);
    }

    hasSetWinner() {
        return false;
    }

    handleCollisions(crashingPlayers) {
        const alive = this.round.getAlivePlayers();
        this.score.update(crashingPlayers, this.round.level);
        if (alive.length <= 1) {
            this.switchRounds(alive[0] || null);
        }
    }

    hasStarted() {
        return this.roundIndex >= 1 || this.round.started;
    }

    detectAutostart(full) {
        if (full && 0 === this.roundIndex) {
            this.round.toggleCountdown(true);
        }
    }
}
