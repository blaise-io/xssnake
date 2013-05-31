/*jshint globalstrict:true, es5:true, expr:true, sub:true*/
/*globals XSS, CONST, Shape*/
'use strict';

/** @typedef {Array.<Object>} */
CONST.Score;

/**
 * @param {Array.<string>} names
 * @param {?Array.<number>} points
 * @constructor
 */
function ScoreBoard(names, points) {
    this.score = this.initScore(names, points);
    this._bindEvents();
    this._sortScore();
    this.shapes = this._updateShapes();
}

ScoreBoard.prototype = {

    podiumSize: 6,

    animDuration: 200,

    destruct: function() {
        XSS.pubsub.off(CONST.EVENT_SCORE_UPDATE, CONST.NS_SCORE);
        for (var k in this.shapes) {
            if (this.shapes.hasOwnProperty(k)) {
                XSS.shapes[k] = null;
            }
        }
    },

    /**
     * @param {Array.<string>} names
     * @param {Array.<number>} points
     * @return {CONST.Score}
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
        XSS.pubsub.on(CONST.EVENT_SCORE_UPDATE, CONST.NS_SCORE, this.updateScore.bind(this));
    },

    /**
     * @param {CONST.Score} score
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
     * @return {CONST.Score}
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
     * @return {Array.<number>}
     * @private
     */
    _podiumIndexToXY: function(index) {
        var top = CONST.HEIGHT - 24,
            lefts = [5, 64];
        return [
            (index % 2) ? lefts[1] : lefts[0],
            top + (Math.floor(index / 2) * 7)
        ];
    },

    /**
     * @return {Object.<Shape>}
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
            width = XSS.font.width(score);

            shape = new Shape();
            shape.add(
                XSS.font.pixels(newScore[newPodium].name, oldPos[0], oldPos[1]),
                XSS.font.pixels(score, oldPos[0] - width + 55, oldPos[1])
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

        XSS.util.extend(XSS.shapes, shapes);

        return shapes;
    }

};
