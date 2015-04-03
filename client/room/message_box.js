'use strict';

/**
 * @param {xss.room.ClientPlayerRegistry} players
 * @constructor
 */
xss.room.MessageBox = function(players) {
    /**
     * MessageBox has its own set of players to compare.
     * @type {xss.room.ClientPlayerRegistry}
     */
    this.previousPlayers = null;
    this.players = players;

    /** @type {Array.<xss.room.Message>} */
    this.messages = [new xss.room.Message(null, xss.COPY_CHAT_INSTRUCT)];

    this.ui = new xss.ui.MessageBox(this.messages, xss.player);
    this.ui.sendMessageFn = this.sendMessage.bind(this);

    this.playerChangeNotified = false;

    this.bindEvents();
};

xss.room.MessageBox.prototype = {

    destruct: function() {
        this.messages.length = 0;
        this.previousPlayers = null;
        this.ui.destruct();
        this.unbindEvents();
    },

    bindEvents: function() {
        xss.event.on(xss.NC_CHAT_MESSAGE, xss.NS_MSGBOX, this.addMessage.bind(this));
        xss.event.on(xss.EV_PLAYERS_UPDATED, xss.NS_MSGBOX, this.updatePlayers.bind(this));
    },

    unbindEvents: function() {
        xss.event.off(xss.NC_CHAT_MESSAGE, xss.NS_MSGBOX);
        xss.event.off(xss.EV_PLAYERS_UPDATED, xss.NS_MSGBOX);
    },

    addMessage: function(serializedMessage) {
        var name = String(this.players.players[serializedMessage[0]].name);
        this.messages.push(new xss.room.Message(name, serializedMessage[1]));
        this.ui.debounceUpdate();
    },

    addNotification: function(notification) {
        this.messages.push(new xss.room.Message(null, notification));
    },

    updatePlayers: function() {
        var disconnectedPlayer = this.players.filter({connected: false})[0];
        if (disconnectedPlayer) {
            this.notifyMidgameDisconnect(disconnectedPlayer);
            this.playerChangeNotified = true;
        } else {
            // Pre-game player updates.
            if (this.previousPlayers && !this.playerChangeNotified) {
                this.notifyPlayersChange();
            }
            this.previousPlayers = new xss.room.ClientPlayerRegistry();
            this.previousPlayers.clone(this.players);
            this.playerChangeNotified = false;
        }
    },

    notifyMidgameDisconnect: function(player) {
        var message = xss.util.format(xss.COPY_PLAYER_QUIT, player.name);
        this.notifyPlayersChangeUI(message);
    },

    notifyPlayersChangeUI: function(message) {
        this.messages.push(new xss.room.Message(null, message));
        this.ui.debounceUpdate();
    },

    notifyPlayersChange: function() {
        var message;
        if (this.players.getTotal() > this.previousPlayers.getTotal()) {
            message = xss.util.format(
                xss.COPY_PLAYER_JOINED,
                String(this.players.getJoinName())
            );
        } else if (this.players.getTotal() < this.previousPlayers.getTotal()) {
            message = xss.util.format(
                xss.COPY_PLAYER_QUIT,
                String(this.players.getQuitName(this.previousPlayers))
            );
        }
        if (message) {
            this.notifyPlayersChangeUI(message);
        }
    },

    sendMessage: function(body) {
        xss.player.emit(xss.NC_CHAT_MESSAGE, [body]);
    }

};
