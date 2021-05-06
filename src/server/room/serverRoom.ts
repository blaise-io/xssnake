import { EventEmitter } from "events";
import { SE_PLAYER_DISCONNECT } from "../../shared/const";
import { NETCODE } from "../../shared/room/netcode";
import { ChatClientMessage, ChatServerMessage } from "../../shared/room/player";
import { RoomKeyMessage, RoomOptions, RoomOptionsMessage } from "../../shared/room/roomOptions";
import { Server } from "../netcode/server";
import { ServerPlayer } from "./serverPlayer";
import { ServerPlayerRegistry } from "./serverPlayerRegistry";
import { ServerRoundSet } from "./serverRoundSet";

export class ServerRoom {
    emitter: EventEmitter;
    players: ServerPlayerRegistry;
    rounds: ServerRoundSet;

    constructor(public server: Server, public options: RoomOptions, public key: string) {
        this.emitter = new EventEmitter();
        this.players = new ServerPlayerRegistry();
        this.rounds = new ServerRoundSet(this.emitter, this.players, this.options);
        this.bindEvents();
    }

    destruct(): void {
        this.emitter.removeAllListeners();
        this.players.destruct();
        this.rounds.destruct();
        delete this.server;
        delete this.players;
        delete this.rounds;
    }

    bindEvents(): void {
        this.emitter.on(
            // TODO: Prevent spam.
            NETCODE.CHAT_MESSAGE_SERVER,
            (player: ServerPlayer, message: ChatServerMessage) => {
                this.players.send(
                    new ChatClientMessage(this.players.indexOf(player), message.body),
                    { exclude: player },
                );
            },
        );
        this.emitter.on(String(SE_PLAYER_DISCONNECT), this.handlePlayerDisconnect.bind(this));
    }

    restartRounds(): void {
        //        this.rounds.destruct();
        //        this.rounds = new RoundManager(this);
        //        this.rounds.detectAutoStart();
        //        this.emitState();
    }

    isAwaitingPlayers(): boolean {
        return !this.isFull() && !this.rounds.hasStarted();
    }

    addPlayer(player: ServerPlayer): void {
        this.players.push(player);
        this.players.sendPlayers();
    }

    detectAutostart(): void {
        this.rounds.detectAutostart(this.isFull());
    }

    emitAll(player: ServerPlayer): void {
        player.send(new RoomKeyMessage(this.key));
        player.send(new RoomOptionsMessage(this.options));
        this.rounds.round.emit(player);
    }

    handlePlayerDisconnect(player: ServerPlayer): void {
        // Remove immediately if rounds have not started.
        // [else: set player.connected to false]
        if (!this.rounds.hasStarted()) {
            this.players.remove(player);
        }
        this.players.sendPlayers();
        this.detectEmptyRoom();
    }

    /** @deprecated move to RoomManager */
    detectEmptyRoom(): void {
        if (this.players.some((sp) => !sp.connected)) {
            this.server.roomManager.remove(this);
        }
    }

    isFull(): boolean {
        return this.players.length === this.options.maxPlayers;
    }
}
