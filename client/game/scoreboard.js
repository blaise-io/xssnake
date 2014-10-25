'use strict';

/** @typedef {Array.<Object>} */
xss.Score;

/**
 * @param {Array.<string>} names
 * @param {?Array.<number>} points
 * @constructor
 */
xss.ScoreBoard = function(names, points) {
    this.score = this.initScore(names, points);
    this._bindEvents();
    this._sortScore();
    this.shapes = this._updateShapes();
};

xss.ScoreBoard.prototype = {

    podiumSize: 6,

    animDuration: 200,

    destruct: function() {
        xss.event.off(xss.NC_SCORE_UPDATE, xss.NS_SCORE);
        for (var k in this.shapes) {
            if (this.shapes.hasOwnProperty(k)) {
                xss.shapes[k] = null;
            }
        }
    },

    /**
     * @param {Array.<string>} names
     * @param {Array.<number>} points
     * @return {xss.Score}
     */
    initScore: function(names, points) {
        var score = [];
        for (var i = 0, m = this.podiumSize; i < m; i++) {
            score.push({
                id   : i,
                name : names[i] || '-',
                score: points && names[i] ? points[i] || 0 : 0
            });
        }
        return score;
    },

    /**
     * @param {Array.<number>} score [playerIndex, newScore]
     */
    updateScore: function(score) {
        var index = this._getPodiumIndexByPlayerId(this.score, score[0]);
        this.score[index].score = score[1];
        this._updateShapes();
    },

    /**
     * @private
     */
    _bindEvents: function() {
        xss.event.on(xss.NC_SCORE_UPDATE, xss.NS_SCORE, this.updateScore.bind(this));
    },

    /**
     * @param {xss.Score} score
     * @param {number} id
     * @return {number}
     * @private
     */
    _getPodiumIndexByPlayerId: function(score, id) {
        for (var i = 0, m = score.length; i < m; i++) {
            if (id === score[i].id) {
                return i;
            }
        }
        return -1;
    },

    /**
     * @return {xss.Score}
     * @private
     */
    _sortScore: function() {
        this.score.sort(function(a, b) {
            return b.score - a.score;
        });
        return this.score;
    },

    /**
     * @param {number} index
     * @return {xss.Coordinate}
     * @private
     */
    _podiumIndexToXY: function(index) {
        var top = xss.HEIGHT - 24,
            lefts = [5, 64];
        return [
            (index % 2) ? lefts[1] : lefts[0],
            top + (Math.floor(index / 2) * 7)
        ];
    },

    /**
     * @return {Object.<xss.Shape>}
     * @private
     */
    _updateShapes: function() {
        var shapes = {},
            oldScore = this.score.slice(),
            newScore = this._sortScore();

        this.score = newScore;

        for (var i = 0, m = oldScore.length; i < m; i++) {
            var oldPodium, newPodium, oldPos, newPos, shape, score, width;

            oldPodium = this._getPodiumIndexByPlayerId(oldScore, i);
            newPodium = this._getPodiumIndexByPlayerId(newScore, i);
            oldPos = this._podiumIndexToXY(oldPodium);

            score = String(newScore[newPodium].score);
            width = xss.font.width(score);

            shape = new xss.Shape();
            shape.add(
                xss.font.pixels(newScore[newPodium].name, oldPos[0], oldPos[1]),
                xss.font.pixels(score, oldPos[0] - width + 55, oldPos[1])
            );

            if (oldPodium !== newPodium) {
                newPos = this._podiumIndexToXY(newPodium);
                shape.animate({
                    to: [newPos[0] - oldPos[0], newPos[1] - oldPos[1]],
                    duration: this.animDuration
                });
            }

            shapes['SB' + i] = shape;
        }

        xss.util.extend(xss.shapes, shapes);

        return shapes;
    }

};
