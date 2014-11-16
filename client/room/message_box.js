'use strict';

/**
 * @constructor
 */
xss.room.MessageBox = function() {
    /** @type {Array.<xss.room.Message>} */
    this.messages = [];

    /**
     * MessageBox has its own set of players to compare.
     * @type {xss.room.ClientPlayerRegistry}
     */
    this.previousPlayers = null;
    this.players = new xss.room.ClientPlayerRegistry();

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
        this.previousPlayers = null;
        this.players = null;
        this.ui.destruct();
        this.unbindEvents();
    },

    bindEvents: function() {
        xss.event.on(xss.NC_CHAT_MESSAGE, xss.NS_MSGBOX, this.addMessage.bind(this));
        xss.event.on(xss.NC_ROOM_PLAYERS_SERIALIZE, xss.NS_MSGBOX, this.updatePlayers.bind(this));
    },

    unbindEvents: function() {
        xss.event.off(xss.NC_CHAT_MESSAGE, xss.NS_MSGBOX, this.addMessage.bind(this));
        xss.event.off(xss.NC_ROOM_PLAYERS_SERIALIZE, xss.NS_MSGBOX);
    },

    addMessage: function(serializedMessage) {
        var name = this.players.players[serializedMessage[0]].name;
        this.messages.push(new xss.room.Message(name, serializedMessage[1]));
        this.ui.debounceUpdate();
    },

    updatePlayers: function(serializedPlayers) {
        this.players.deserialize(serializedPlayers);
        if (this.previousPlayers) {
            this.notifyPlayersChange();
        }
        this.previousPlayers = new xss.room.ClientPlayerRegistry();
        this.previousPlayers.clone(this.players);
    },

    notifyPlayersChange: function() {
        var body, name;
        if (this.players.getTotal() > this.previousPlayers.getTotal()) {
            body = xss.COPY_PLAYER_JOINED;
            name = this.previousPlayers.getJoin(this.players).name;
        } else if (this.players.getTotal() < this.previousPlayers.getTotal()) {
            body = xss.COPY_PLAYER_QUIT;
            name = this.previousPlayers.getQuit(this.players).name;
        }
        this.messages.push(
            new xss.room.Message(null, xss.util.format(body, name))
        );
        this.ui.debounceUpdate();
    },

    sendMessage: function(body) {
        xss.player.emit(xss.NC_CHAT_MESSAGE, [body]);
    }

};
