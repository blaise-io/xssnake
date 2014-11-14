'use strict';

/**
 * @param {xss.room.PlayerRegistry} players
 * @constructor
 */
xss.room.MessageBox = function(players) {
    /** @type {Array.<xss.room.Message>} */
    this.messages = [];
    this.player = players;
    this.ui = new xss.ui.MessageBox(this.messages);

    this.messages.push(new xss.room.Message('Hello', 'First'));
    this.messages.push(new xss.room.Message('Hello', 'Mid'));
    this.messages.push(new xss.room.Message('Hello', 'Last'));
};

xss.room.MessageBox.prototype = {

};
