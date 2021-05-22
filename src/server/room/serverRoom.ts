import { EventEmitter } from "events";
import { ChatClientMessage, ChatServerMessage } from "../../shared/room/playerMessages";
import {
    ROOM_KEY_LENGTH,
    RoomKeyMessage,
    RoomOptionsClientMessage,
} from "../../shared/room/roomMessages";
import { RoomOptions } from "../../shared/room/roomOptions";
import { RoundLevelMessage } from "../../shared/room/roundMessages";
import { randomStr } from "../../shared/util";
import { SERVER_EVENT } from "../const";
import { ServerPlayer } from "./serverPlayer";
import { ServerPlayerRegistry } from "./serverPlayerRegistry";
import { ServerRoundSet } from "./serverRoundSet";

export class ServerRoom {
    readonly emitter = new EventEmitter();
    readonly players = new ServerPlayerRegistry();
    readonly rounds = new ServerRoundSet(this.emitter, this.players, this.options);
    playerIdCounter = 100; // TODO: back to 0

    constructor(public options: RoomOptions, public key = randomStr(ROOM_KEY_LENGTH)) {
        this.bindEvents();
    }

    destruct(): void {
        this.emitter.removeAllListeners();
        this.players.destruct();
        this.rounds.destruct();
    }

    bindEvents(): void {
        this.emitter.on(
            // TODO: Prevent spam.
            ChatServerMessage.id,
            (player: ServerPlayer, message: ChatServerMessage) => {
                this.players.send(new ChatClientMessage(player.id, message.body), {
                    exclude: player,
                });
            },
        );
    }

    // restartRounds(): void {
    //    this.rounds.destruct();
    //    this.rounds = new RoundManager(this);
    //    this.rounds.detectAutoStart();
    //    this.emitState();
    // }

    isAwaitingPlayers(): boolean {
        return !this.full && !this.rounds.started;
    }

    addPlayer(player: ServerPlayer): void {
        player.id = ++this.playerIdCounter;
        this.players.push(player);
        this.players.sendPlayers();
        if (this.full && !this.rounds.roundsPlayed) {
            this.rounds.start();
        }
    }

    removePlayer(player: ServerPlayer): Promise<ServerRoom> {
        return new Promise((resolve) => {
            if (this.rounds.started) {
                // We keep a disconnected player instance during the game.
                // TODO: Don't
                this.emitter.on(SERVER_EVENT.ROUND_END, () => {
                    this.players.sendPlayers();
                    resolve(this);
                });
            } else {
                this.players.remove(player);
                this.players.sendPlayers();
                resolve(this);
            }
        });
    }

    sendInitial(player: ServerPlayer): void {
        player.send(new RoomKeyMessage(this.key));
        player.send(new RoomOptionsClientMessage(this.options));
        player.send(new RoundLevelMessage(this.rounds.round.levelIndex));
    }

    get full(): boolean {
        return this.players.length === this.options.maxPlayers;
    }
}
