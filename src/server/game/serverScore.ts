import { ScoreMessage } from "../../shared/game/scoreMessages";
import { Level } from "../../shared/level/level";
import { ServerPlayer } from "../room/serverPlayer";
import { ServerPlayerRegistry } from "../room/serverPlayerRegistry";

export class ServerScore {
    constructor(public players: ServerPlayerRegistry) {}

    destruct(): void {
        delete this.players;
    }

    /**
     * Returns whether player score is affected.
     */
    update(crashedPlayers: ServerPlayer[], level: Level): boolean {
        let scoreUpdated = false;
        if (!level) {
            console.error("FIXME");
            return false;
        }
        const points = crashedPlayers.length * level.settings.pointsKnockout;
        if (points) {
            for (let i = 0, m = this.players.length; i < m; i++) {
                const player = this.players[i];
                if (-1 === crashedPlayers.indexOf(player) && !player.snake.crashed) {
                    player.score += points;
                    scoreUpdated = true;
                }
            }
        }
        if (scoreUpdated) {
            this.players.send(new ScoreMessage(this.players.map((p) => p.score)));
        }
    }

    ///**
    // * @return {serialized.Client}
    // */
    //getWinner() {
    //    let sorted, last, playerIndex;
    //
    //    sorted = this.points.slice().sort();
    //    last = sorted.length - 1;
    //    playerIndex = this.points.indexOf(sorted[last]);
    //
    //    return (sorted[last] - ROOM_WIN_BY_MIN >= sorted[last - 1]) ?
    //        this.room.players[playerIndex] : null;
    //},
    //
    ///**
    // * @param {serialized.Client} client
    // */
    //bufferApplePoints(client) {
    //    let points = ++this.points[client.model.playerIndex];
    //    this.room.buffer(
    //        NC_SCORE_UPDATE, [client.model.playerIndex, points]
    //    );
    //},
    //
    ///**
    // * @param {serialized.Client} client
    // * @return {number}
    // */
    //rank(client) {
    //    let clientPoints, points = this.points, position = 0;
    //
    //    if (points.length === 1) {
    //        return SCORE_NEUTRAL;
    //    }
    //
    //    clientPoints = points[client.model.playerIndex];
    //    for (let i = 0, m = points.length; i < m; i++) {
    //        if (clientPoints > points[i]) {
    //            position++;
    //        } else if (clientPoints < points[i]) {
    //            position--;
    //        }
    //    }
    //
    //    if (position === 0) {
    //        return SCORE_NEUTRAL;
    //    } else {
    //        return position > 0 ? SCORE_LEADING : SCORE_BEHIND;
    //    }
    //}
}
