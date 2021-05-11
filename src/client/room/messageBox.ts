import { Player } from "../../shared/room/player";
import { ChatClientMessage, ChatServerMessage } from "../../shared/room/playerMessages";
import { _ } from "../../shared/util";
import { EV_PLAYERS_UPDATED, NS, UC } from "../const";
import { State } from "../state";
import { MessageBoxUI } from "../ui/messageBox";
import { ClientPlayerRegistry } from "./clientPlayerRegistry";
import { ChatMessage } from "./chatMessage";

export class MessageBox {
    // Keep previous players until player leaving is propagated.
    private previousPlayers?: ClientPlayerRegistry;
    private messages: ChatMessage[];
    ui: MessageBoxUI;
    private playerChangeNotified = false;

    constructor(public players: ClientPlayerRegistry) {
        this.messages = [new ChatMessage(undefined, _(`Press ${UC.ENTER_KEY} to chat.`))];

        this.ui = new MessageBoxUI(this.messages, players.localPlayer, (body) => {
            this.players.localPlayer.send(new ChatServerMessage(body));
        });

        State.events.on(ChatClientMessage.id, NS.MSGBOX, (message: ChatClientMessage) => {
            const name = String(this.players[message.playerIndex].name);
            this.messages.push(new ChatMessage(name, message.body));
            this.ui.debounceUpdate();
        });
        State.events.on(EV_PLAYERS_UPDATED, NS.MSGBOX, this.updatePlayers.bind(this));
    }

    destruct(): void {
        this.messages.length = 0;
        // delete this.previousPlayers;
        this.ui.destruct();
        State.events.off(ChatClientMessage.id, NS.MSGBOX);
        State.events.off(EV_PLAYERS_UPDATED, NS.MSGBOX);
    }

    addNotification(notification: string): void {
        this.messages.push(new ChatMessage(undefined, notification));
    }

    updatePlayers(): void {
        const disconnectedPlayer = this.players.find((p) => !p.connected);
        if (disconnectedPlayer) {
            this.notifyMidgameDisconnect(disconnectedPlayer);
            this.playerChangeNotified = true;
        } else {
            // Pre-game player updates.
            if (this.previousPlayers && !this.playerChangeNotified) {
                this.notifyPlayersChange();
            }
            this.previousPlayers = new ClientPlayerRegistry(...this.players);
            this.playerChangeNotified = false;
        }
    }

    notifyMidgameDisconnect(player: Player): void {
        this.notifyPlayersChangeUI(_(`${player.name} quit`));
    }

    notifyPlayersChangeUI(message: string): void {
        this.messages.push(new ChatMessage(undefined, message));
        this.ui.debounceUpdate();
    }

    notifyPlayersChange(): void {
        if (!this.previousPlayers || this.players.length > this.previousPlayers.length) {
            const name = this.players.getLastJoin();
            this.notifyPlayersChangeUI(_(`${name} joined`));
        } else if (this.players.length < this.previousPlayers.length) {
            const name = this.players.getQuitName(this.previousPlayers);
            this.notifyPlayersChangeUI(_(`${name} quit`));
        }
    }
}
