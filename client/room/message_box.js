'use strict';

/**
 * @param {xss.room.PlayerRegistry} players
 * @constructor
 */
xss.room.MessageBox = function(players) {
    /** @type {Array.<xss.room.Message>} */
    this.messages = [];
    this.players = players;

    this.messages.push(
        new xss.room.Message(null, xss.COPY_CHAT_INSTRUCT)
    );

    this.ui = new xss.ui.MessageBox(this.messages, xss.player);
    this.ui.sendMessageFn = this.sendMessage.bind(this);

    this.bindEvents();
};

xss.room.MessageBox.prototype = {

    destruct: function() {
        this.messages.length = 0;
        this.players = null;
        this.ui.destruct();
        this.unbindEvents();
    },

    bindEvents: function() {
        xss.event.on(xss.NC_CHAT_MESSAGE, xss.NS_ROOM, this.addMessage.bind(this));
    },

    unbindEvents: function() {
        xss.event.off(xss.NC_CHAT_MESSAGE, xss.NS_ROOM, this.addMessage.bind(this));
    },

    addMessage: function(serializedMessage) {
        var name = this.players.players[serializedMessage[0]].name;
        this.messages.push(new xss.room.Message(name, serializedMessage[1]));
        this.ui.debounceUpdate();
    },

    sendMessage: function(body) {
        xss.player.emit(xss.NC_CHAT_MESSAGE, [body]);
    }

};
