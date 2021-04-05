/**
 * @param {room.ServerPlayerRegistry} players
 * @constructor
 */
export class ServerScore {
    constructor(ServerScore) {
        this.players = players;
    }



    destruct() {
        this.players = null;
    }

    /**
     * @param {Array.<room.ServerPlayer>} crashedPlayers
     * @param {level.Level} level
     * @return {boolean} Player score is affected.
     */
    update(crashedPlayers, level): void {
        let points; let scoreUpdated = false;
        if (!level) {
            console.error("FIXME");
            return false;
        }
        points = crashedPlayers.length * level.config.pointsKnockout;
        if (points) {
            for (let i = 0, m = this.players.players.length; i < m; i++) {
                const player = this.players.players[i];
                if (-1 === crashedPlayers.indexOf(player) && !player.snake.crashed) {
                    player.score += points;
                    scoreUpdated = true;
                }
            }
        }
        if (scoreUpdated) {
            this.emitScore();
        }
    }

    /**
     * @return {Array.<number>}
     */
    serialize() {
        const score = [];
        for (let i = 0, m = this.players.players.length; i < m; i++) {
            score.push(this.players.players[i].score);
        }
        return score;
    }

    emitScore() {
        this.players.emit(NC_SCORE_UPDATE, this.serialize());
    }

    ///**
    // * @return {netcode.Client}
    // */
    //getWinner() {
    //    var sorted, last, index;
    //
    //    sorted = this.points.slice().sort();
    //    last = sorted.length - 1;
    //    index = this.points.indexOf(sorted[last]);
    //
    //    return (sorted[last] - ROOM_WIN_BY_MIN >= sorted[last - 1]) ?
    //        this.room.players[index] : null;
    //},
    //
    ///**
    // * @param {netcode.Client} client
    // */
    //bufferApplePoints(client) {
    //    var points = ++this.points[client.model.index];
    //    this.room.buffer(
    //        NC_SCORE_UPDATE, [client.model.index, points]
    //    );
    //},
    //
    ///**
    // * @param {netcode.Client} client
    // * @return {number}
    // */
    //rank(client) {
    //    var clientPoints, points = this.points, position = 0;
    //
    //    if (points.length === 1) {
    //        return SCORE_NEUTRAL;
    //    }
    //
    //    clientPoints = points[client.model.index];
    //    for (var i = 0, m = points.length; i < m; i++) {
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
