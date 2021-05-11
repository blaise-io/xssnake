import { ServerPlayer } from "../room/serverPlayer";
import { ServerPlayerRegistry } from "../room/serverPlayerRegistry";

export class ServerScore {
    constructor(public players: ServerPlayerRegistry) {}

    destruct(): void {
        // delete this.players;
    }

    // /**
    //  * Returns whether player score is affected.
    //  */
    // update(crashedSnakes: ServerSnake[], level: Level): boolean {
    //     let scoreUpdated = false;
    //     const points = crashedSnakes.length * level.settings.pointsKnockout;
    //     if (points) {
    //         for (let i = 0, m = crashedSnakes.length; i < m; i++) {
    //             if (!crashedSnakes.crashed) {
    //                 player.score += points;
    //                 scoreUpdated = true;
    //             }
    //         }
    //     }
    //     if (scoreUpdated) {
    //         this.players.send(new ScoreMessage(this.players.map((p) => p.score)));
    //     }
    //     return scoreUpdated;
    // }

    get points(): number[] {
        return this.players.map((p) => p.score);
    }

    getWinner(minPointsDiff: number): ServerPlayer | undefined {
        if (this.players.length <= 1) {
            return undefined;
        }
        const playersByScore = this.players.sort((p1, p2) => p1.score - p2.score);
        if (playersByScore[0].score - playersByScore[1].score >= minPointsDiff) {
            return playersByScore[0];
        }
    }

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
