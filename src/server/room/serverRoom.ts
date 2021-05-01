import { NC_CHAT_MESSAGE, NC_ROOM_SERIALIZE, SE_PLAYER_DISCONNECT } from "../../shared/const";
import { AUDIENCE, Message, NETCODE } from "../../shared/room/netcode";
import { RoomOptions, RoomOptionsMessage } from "../../shared/room/roomOptions";
import { Sanitizer } from "../../shared/util/sanitizer";
import { Server } from "../netcode/server";
import { EventEmitter } from "events";
import { ServerPlayer } from "./serverPlayer";
import { ServerPlayerRegistry } from "./serverPlayerRegistry";
import { ServerRoundSet } from "./serverRoundSet";

// TODO: When do we need to send a room key? --> as part of serialize so others can share
// TODO: Reuse autojoin flow a bit more?
export class ServerRoomMessage implements Message {
    static id = NETCODE.ROOM_SERIALIZE;
    static audience = AUDIENCE.CLIENT;

    constructor(public key: string) {}

    get netcode(): string {
        return this.key;
    }

    static fromNetcode(netcode: string): string {
        return netcode;
    }
}

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
        this.server = undefined;
        this.players = undefined;
        this.rounds = undefined;
    }

    bindEvents(): void {
        this.emitter.on(String(NC_CHAT_MESSAGE), this.ncChatMessage.bind(this));
        this.emitter.on(String(SE_PLAYER_DISCONNECT), this.handlePlayerDisconnect.bind(this));
    }

    ncChatMessage(serializedMessage, player) {
        const sanitizer = new Sanitizer(serializedMessage[0]);
        sanitizer.assertStringOfLength(1, 64);
        if (sanitizer.valid()) {
            // TODO Prevent spam.
            player.broadcast(NC_CHAT_MESSAGE, [
                this.players.players.indexOf(player),
                sanitizer.getValueOr(),
            ]);
        }
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

    /** @deprecated */
    serialize() {
        return [this.key];
    }

    addPlayer(player: ServerPlayer): void {
        this.players.add(player);
        player.room = this;
        this.players.emitPlayers();
    }

    detectAutostart(): void {
        this.rounds.detectAutostart(this.isFull());
    }

    /** @deprecated */
    emit(player: ServerPlayer): void {
        player.emit(NC_ROOM_SERIALIZE, this.serialize());
    }

    emitAll(player: ServerPlayer): void {
        player.send(new ServerRoomMessage(this.key));
        player.send(new RoomOptionsMessage(this.options));
        this.rounds.round.emit(player);
    }

    handlePlayerDisconnect(player: ServerPlayer): void {
        // Remove immediately if rounds have not started.
        // [else: set player.connected to false]
        if (!this.rounds.hasStarted()) {
            this.players.remove(player);
        }
        this.players.emitPlayers();
        this.detectEmptyRoom();
    }

    /** @deprecated move to manager */
    detectEmptyRoom(): void {
        if (this.players.players.some((sp) => sp.connected)) {
            this.server.roomManager.remove(this);
        }
    }

    isFull(): boolean {
        return this.players.getTotal() === this.options.maxPlayers;
    }
}
