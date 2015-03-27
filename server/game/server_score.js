'use strict';

/**
 * @param {xss.room.ServerPlayerRegistry} players
 * @constructor
 */
xss.game.ServerScore = function(players) {
    this.players = players;
};

xss.game.ServerScore.prototype = {

    destruct: function() {
        this.players = null;
    },

    /**
     * @param {Array.<xss.room.ServerPlayer>} crashedPlayers
     * @param {xss.level.Level} level
     * @return {boolean} Player score is affected.
     */
    update: function(crashedPlayers, level) {
        var points, scoreUpdated = false;
        points = crashedPlayers.length * level.config.pointsKnockout;
        if (points) {
            for (var i = 0, m = this.players.players.length; i < m; i++) {
                var player = this.players.players[i];
                if (-1 === crashedPlayers.indexOf(player) && !player.snake.crashed) {
                    player.score += points;
                    scoreUpdated = true;
                }
            }
        }
        if (scoreUpdated) {
            this.emitScore();
        }
    },

    /**
     * @return {Array.<number>}
     */
    serialize: function() {
        var score = [];
        for (var i = 0, m = this.players.players.length; i < m; i++) {
            score.push(this.players.players[i].score);
        }
        return score;
    },

    emitScore: function() {
        this.players.emit(xss.NC_SCORE_UPDATE, this.serialize());
    }

    ///**
    // * @return {xss.netcode.Client}
    // */
    //getWinner: function() {
    //    var sorted, last, index;
    //
    //    sorted = this.points.slice().sort();
    //    last = sorted.length - 1;
    //    index = this.points.indexOf(sorted[last]);
    //
    //    return (sorted[last] - xss.ROOM_WIN_BY_MIN >= sorted[last - 1]) ?
    //        this.room.players[index] : null;
    //},
    //
    ///**
    // * @param {xss.netcode.Client} client
    // */
    //bufferApplePoints: function(client) {
    //    var points = ++this.points[client.model.index];
    //    this.room.buffer(
    //        xss.NC_SCORE_UPDATE, [client.model.index, points]
    //    );
    //},
    //
    ///**
    // * @param {xss.netcode.Client} client
    // * @return {number}
    // */
    //rank: function(client) {
    //    var clientPoints, points = this.points, position = 0;
    //
    //    if (points.length === 1) {
    //        return xss.SCORE_NEUTRAL;
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
    //        return xss.SCORE_NEUTRAL;
    //    } else {
    //        return position > 0 ? xss.SCORE_LEADING : xss.SCORE_BEHIND;
    //    }
    //}
};
