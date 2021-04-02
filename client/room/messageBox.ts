/**
 * @param {room.ClientPlayerRegistry} players
 * @constructor
 */
import { NC_CHAT_MESSAGE } from "../../shared/const";
import { EV_PLAYERS_UPDATED, NS_MSGBOX } from "../const";
import { COPY_CHAT_INSTRUCT, COPY_PLAYER_JOINED, COPY_PLAYER_QUIT } from "../copy/copy";
import { State } from "../state/state";
import { ClientPlayerRegistry } from "./clientPlayerRegistry";
import { Message } from "./message";

export class MessageBox {
    constructor(players) {
    /**
     * MessageBox has its own set of players to compare.
     * @type {room.ClientPlayerRegistry}
     */
    this.previousPlayers = null;
    this.players = players;

    /** @type {Array.<room.Message>} */
    this.messages = [new Message(null, COPY_CHAT_INSTRUCT)];

    this.ui = new ui.MessageBox(this.messages, State.player);
    this.ui.sendMessageFn = this.sendMessage.bind(this);

    this.playerChangeNotified = false;

    this.bindEvents();
};



    destruct() {
        this.messages.length = 0;
        this.previousPlayers = null;
        this.ui.destruct();
        this.unbindEvents();
    }    bindEvents() {
        State.events.on(NC_CHAT_MESSAGE, NS_MSGBOX, this.addMessage.bind(this));
        State.events.on(EV_PLAYERS_UPDATED, NS_MSGBOX, this.updatePlayers.bind(this));
    }    unbindEvents() {
        State.events.off(NC_CHAT_MESSAGE, NS_MSGBOX);
        State.events.off(EV_PLAYERS_UPDATED, NS_MSGBOX);
    }    addMessage(serializedMessage) {
        var name = String(this.players.players[serializedMessage[0]].name);
        this.messages.push(new Message(name, serializedMessage[1]));
        this.ui.debounceUpdate();
    }    addNotification(notification) {
        this.messages.push(new Message(null, notification));
    }    updatePlayers() {
        var disconnectedPlayer = this.players.filter({connected: false})[0];
        if (disconnectedPlayer) {
            this.notifyMidgameDisconnect(disconnectedPlayer);
            this.playerChangeNotified = true;
        } else {
            // Pre-game player updates.
            if (this.previousPlayers && !this.playerChangeNotified) {
                this.notifyPlayersChange();
            }
            this.previousPlayers = new ClientPlayerRegistry();
            this.previousPlayers.clone(this.players);
            this.playerChangeNotified = false;
        }
    }    notifyMidgameDisconnect(player) {
        var message = format(COPY_PLAYER_QUIT, player.name);
        this.notifyPlayersChangeUI(message);
    }    notifyPlayersChangeUI(message) {
        this.messages.push(new Message(null, message));
        this.ui.debounceUpdate();
    }    notifyPlayersChange() {
        var message;
        if (this.players.getTotal() > this.previousPlayers.getTotal()) {
            message = format(
                COPY_PLAYER_JOINED,
                String(this.players.getJoinName())
            );
        } else if (this.players.getTotal() < this.previousPlayers.getTotal()) {
            message = format(
                COPY_PLAYER_QUIT,
                String(this.players.getQuitName(this.previousPlayers))
            );
        }
        if (message) {
            this.notifyPlayersChangeUI(message);
        }
    }    sendMessage(body) {
        State.player.emit(NC_CHAT_MESSAGE, [body]);
    }

};
