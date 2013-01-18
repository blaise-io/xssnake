/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Game, Chat, ScoreBoard*/
'use strict';

/**
 * @param {number} index
 * @param {number} level
 * @param {Array.<string>} names
 * @param {Array.<number>} score
 * @constructor
 */
function Room(index, level, names, score) {
    this.game = null;
    this.score = null;
    this.chat = null;
    this.update.apply(this, arguments);
}

Room.prototype = {

    destruct: function() {
        this.game.destruct();
        this.score.destruct();
        this.chat.destruct();
    },

    /**
     * @param {number} index
     * @param {number} level
     * @param {Array.<string>} names
     * @param {Array.<number>} score
     */
    update: function(index, level, names, score) {
        names = this._sanitizeNames(names);
        this.score = new ScoreBoard(names, score);
        if (this.game) {
            this.game.destruct();
        }
        this.game = new Game(index, level, names);

        if (this.chat) {
            this.chat.index = index;
            this.chat.names = names;
        } else {
            this.chat = new Chat(index, names);
        }
    },

    /**
     * @param {Array.<string>} names
     * @return {Array.<string>}
     * @private
     */
    _sanitizeNames: function(names) {
        for (var i = 0, m = names.length; i < m; i++) {
            while (XSS.font.width(names[i]) > XSS.UI_MAX_NAME_WIDTH) {
                names[i] = names[i].slice(0, -1);
            }
        }
        return names;
    }

};