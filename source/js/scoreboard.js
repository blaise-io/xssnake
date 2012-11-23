/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Shape, Util*/
'use strict';

/** @typedef {Array.<Object>} */
var Score;

/**
 * @param {Array.<string>} names
 * @param {?Array.<number>} points
 * @constructor
 */
function ScoreBoard(names, points) {
    this.score = this.initScore(names, points);
    this._sortScore();
    this.shapes = this._updateShapes();
}

ScoreBoard.prototype = {

    podiumSize: 6,

    switchDuration: 200,

    destruct: function() {
        for (var k in this.shapes) {
            if (this.shapes.hasOwnProperty(k)) {
                delete XSS.shapes[k];
            }
        }
    },

    /**
     * @param {Array.<string>} names
     * @param {Array.<number>} points
     * @return {Score}
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
     * @param {number} playerID
     * @param {number} newScore
     */
    updateScore: function(playerID, newScore) {
        var index = this._getPodiumIndexByPlayerId(this.score, playerID);
        this.score[index].score = newScore;
        this._updateShapes();
    },

    /**
     * @param {Score} score
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
     * @return {Score}
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
        var top = XSS.PIXELS_V - 23,
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
                XSS.font.pixels(oldPos[0], oldPos[1], newScore[newPodium].name),
                XSS.font.pixels(oldPos[0] - width + 55, oldPos[1], score)
            );

            if (oldPodium !== newPodium) {
                newPos = this._podiumIndexToXY(newPodium);
                shape.animate({
                    to: [newPos[0] - oldPos[0], newPos[1] - oldPos[1]],
                    duration: this.switchDuration
                });
            }

            shapes['SB' + i] = shape;
        }

        Util.extend(XSS.shapes, shapes);

        return shapes;
    }

};