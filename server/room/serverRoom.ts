import { NC_CHAT_MESSAGE, NC_ROOM_SERIALIZE, SE_PLAYER_DISCONNECT } from "../../shared/const";
import { Sanitizer } from "../../shared/util/sanitizer";
import { Server } from "../netcode/server";
import { ServerOptions } from "./serverOptions";
import { EventEmitter } from "events";
import { ServerPlayerRegistry } from "./serverPlayerRegistry";
import { ServerRoundSet } from "./serverRoundSet";

export class ServerRoom {
    emitter: EventEmitter;
    players: ServerPlayerRegistry;
    rounds: ServerRoundSet;

    constructor(public server: Server, public options: ServerOptions, public key: string) {
        this.emitter = new EventEmitter();
        this.players = new ServerPlayerRegistry();
        this.rounds = new ServerRoundSet(this.emitter, this.players, this.options);
        this.bindEvents();
    }

    destruct() {
        this.emitter.removeAllListeners();
        this.players.destruct();
        this.rounds.destruct();
        this.server = null;
        this.players = null;
        this.rounds = null;
    }

    bindEvents() {
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

    restartRounds() {
        //        this.rounds.destruct();
        //        this.rounds = new RoundManager(this);
        //        this.rounds.detectAutoStart();
        //        this.emitState();
    }

    isAwaitingPlayers() {
        return !this.isFull() && !this.rounds.hasStarted();
    }

    /**
     * @return {Array.<string>}
     */
    serialize() {
        return [this.key];
    }

    /**
     * @param {room.ServerPlayer} player
     */
    addPlayer(player): void {
        this.players.add(player);
        player.room = this;
        this.players.emitPlayers();
    }

    detectAutostart() {
        this.rounds.detectAutostart(this.isFull());
    }

    emit(player) {
        player.emit(NC_ROOM_SERIALIZE, this.serialize());
    }

    emitAll(player) {
        this.emit(player);
        this.options.emit(player);
        this.rounds.round.emit(player);
    }

    handlePlayerDisconnect(player) {
        // Remove immediately if rounds have not started.
        // [else: set player.connected to false]
        if (!this.rounds.hasStarted()) {
            this.players.remove(player);
        }
        this.players.emitPlayers();
        this.detectEmptyRoom();
    }

    detectEmptyRoom() {
        if (this.players.players.some((sp) => sp.connected)) {
            this.server.roomManager.remove(this);
        }
    }

    /**
     * @return {boolean}
     */
    isFull() {
        return this.players.getTotal() === this.options.maxPlayers;
    }
}
