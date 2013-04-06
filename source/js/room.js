/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Game, Chat, ScoreBoard*/
'use strict';

/**
 * @param {number} index
 * @param {string} key
 * @param {number} level
 * @param {Array.<string>} names
 * @param {Array.<number>} score
 * @constructor
 */
function Room(index, key, level, names, score) {
    this.game = null;
    this.score = null;
    this.chat = null;
    this.update.apply(this, arguments);
    XSS.util.hash('room', key);
}

Room.prototype = {

    destruct: function() {
        this.game.destruct();
        this.score.destruct();
        this.chat.destruct();
    },

    /**
     * @param {number} index
     * @param {string} key
     * @param {number} level
     * @param {Array.<string>} names
     * @param {Array.<number>} score
     */
    update: function(index, key, level, names, score) {
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
     * @param {number} error
     * @returns {string}
     */
    errorCodeToStr: function(error) {
        switch (error) {
            case XSS.map.ROOM.NOT_FOUND:
                return '404 ROOM NOT FOUND';
            case XSS.map.ROOM.FULL:
                return 'LE ROOM IS FULL!';
            case XSS.map.ROOM.IN_PROGRESS:
                return 'GAME ALREADY IN PROGRESS!';
            default:
                return 'UNKNOWN ERROR OHSHI'
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