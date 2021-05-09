import { EventEmitter } from "events";
import { SERVER_EVENT } from "../../shared/const";
import { ChatClientMessage, ChatServerMessage } from "../../shared/room/playerMessages";
import { RoomKeyMessage, RoomOptionsMessage } from "../../shared/room/roomMessages";
import { RoomOptions } from "../../shared/room/roomOptions";
import { RoundMessage } from "../../shared/room/roundMessages";
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
        // delete this.server;
        // delete this.players;
        // delete this.rounds;
    }

    bindEvents(): void {
        this.emitter.on(
            // TODO: Prevent spam.
            ChatServerMessage.id,
            (player: ServerPlayer, message: ChatServerMessage) => {
                this.players.send(
                    new ChatClientMessage(this.players.indexOf(player), message.body),
                    { exclude: player },
                );
            },
        );
        this.emitter.on(SERVER_EVENT.PLAYER_DISCONNECT, (player: ServerPlayer) => {
            // Remove immediately if rounds have not started.
            // [else: set player.connected to false]
            if (!this.rounds.hasStarted()) {
                this.players.remove(player);
            } else {
                // TODO: Check whether this dupes PlayerRegistry, should also inform room.
                player.connected = false;
            }
            this.players.sendPlayers();
            this.detectEmptyRoom();
        });
    }

    // restartRounds(): void {
    //    this.rounds.destruct();
    //    this.rounds = new RoundManager(this);
    //    this.rounds.detectAutoStart();
    //    this.emitState();
    // }

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

    sendInitial(player: ServerPlayer): void {
        player.send(new RoomKeyMessage(this.key));
        player.send(new RoomOptionsMessage(this.options));
        player.send(RoundMessage.fromRound(this.rounds.round));
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
