import { NC_CHAT_MESSAGE } from "../../shared/const";
import { _ } from "../../shared/util";
import { EV_PLAYERS_UPDATED, NS, UC } from "../const";
import { COPY_PLAYER_JOINED, COPY_PLAYER_QUIT } from "../copy/copy";
import { State } from "../state";
import { MessageBoxUI } from "../ui/messageBox";
import { format } from "../util/clientUtil";
import { ClientPlayer } from "./clientPlayer";
import { ClientPlayerRegistry } from "./clientPlayerRegistry";
import { ClientSocketPlayer } from "./clientSocketPlayer";
import { ChatMessage } from "./chatMessage";

export class MessageBox {
    private previousPlayers: ClientPlayerRegistry = undefined; // Keep old registry until player leaving is propagated.
    private messages: ChatMessage[];
    ui: MessageBoxUI;
    private playerChangeNotified = false;

    constructor(public players: ClientPlayerRegistry) {
        this.messages = [new ChatMessage(null, _(`Press ${UC.ENTER_KEY} to chat.`))];
        this.ui = new MessageBoxUI(this.messages, players.localPlayer, (body) => {
            (this.players.localPlayer as ClientSocketPlayer).emitDeprecated(NC_CHAT_MESSAGE, [
                body,
            ]);
        });
        State.events.on(NC_CHAT_MESSAGE, NS.MSGBOX, this.addMessage.bind(this));
        State.events.on(EV_PLAYERS_UPDATED, NS.MSGBOX, this.updatePlayers.bind(this));
    }

    destruct(): void {
        this.messages.length = 0;
        delete this.previousPlayers;
        this.ui.destruct();
        State.events.off(NC_CHAT_MESSAGE, NS.MSGBOX);
        State.events.off(EV_PLAYERS_UPDATED, NS.MSGBOX);
    }

    addMessage(serializedMessage: [number, string]): void {
        const name = String(this.players[serializedMessage[0]].name);
        this.messages.push(new ChatMessage(name, serializedMessage[1]));
        this.ui.debounceUpdate();
    }

    addNotification(notification: string): void {
        this.messages.push(new ChatMessage(null, notification));
    }

    updatePlayers(): void {
        // TODO: recursion?
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

    notifyMidgameDisconnect(player: ClientPlayer): void {
        const message = format(COPY_PLAYER_QUIT, player.name);
        this.notifyPlayersChangeUI(message);
    }

    notifyPlayersChangeUI(message: string): void {
        this.messages.push(new ChatMessage(null, message));
        this.ui.debounceUpdate();
    }

    notifyPlayersChange(): void {
        let message;
        if (this.players.length > this.previousPlayers.length) {
            message = format(COPY_PLAYER_JOINED, String(this.players.getLastJoin()));
        } else if (this.players.length < this.previousPlayers.length) {
            message = format(
                COPY_PLAYER_QUIT,
                String(this.players.getQuitName(this.previousPlayers)),
            );
        }
        if (message) {
            this.notifyPlayersChangeUI(message);
        }
    }
}
