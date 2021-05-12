import { Player } from "../../shared/room/player";
import { ChatClientMessage, ChatServerMessage } from "../../shared/room/playerMessages";
import { PlayersMessage } from "../../shared/room/playerRegistry";
import { _ } from "../../shared/util";
import { UC } from "../const";
import { eventx } from "../netcode/eventHandler";
import { MessageBoxUI } from "../ui/messageBox";
import { ClientPlayerRegistry } from "./clientPlayerRegistry";
import { ChatMessage } from "./chatMessage";

export class MessageBox {
    // Keep previous players until player leaving is propagated.
    private previousPlayers?: ClientPlayerRegistry;
    private messages: ChatMessage[];
    ui: MessageBoxUI;
    private playerChangeNotified = false;
    private eventContext = eventx.context;

    constructor(public players: ClientPlayerRegistry) {
        this.messages = [new ChatMessage(undefined, _(`Press ${UC.ENTER_KEY} to chat.`))];

        this.ui = new MessageBoxUI(this.messages, players.localPlayer, (body) => {
            this.players.localPlayer.send(new ChatServerMessage(body));
        });

        this.eventContext.on(ChatClientMessage.id, (message: ChatClientMessage) => {
            const name = String(this.players[message.playerIndex].name);
            this.messages.push(new ChatMessage(name, message.body));
            this.ui.debounceUpdate();
        });
        this.eventContext.on(PlayersMessage.id, this.updatePlayers.bind(this));
    }

    destruct(): void {
        this.messages.length = 0;
        this.previousPlayers?.destruct();
        this.ui.destruct();
        this.eventContext.destruct();
        delete this.previousPlayers;
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
