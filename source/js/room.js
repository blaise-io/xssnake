/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Game, Chat*/
'use strict';

/**
 * @param {number} index
 * @param {number} level
 * @param {Array.<string>} names
 * @constructor
 */
function Room(index, level, names) {
    this.update.apply(this, arguments);
    this.chat = new Chat(names[index]);
}

Room.prototype = {

    /**
     * @param {number} index
     * @param {number} level
     * @param {Array.<string>} names
     */
    update: function(index, level, names) {
        if (this.game) {
            this.game.destruct();
        }
        this.game = new Game(index, level, names);
    }

};