import { ROOM_STATUS, ROOM_KEY_LENGTH } from "../../shared/const";
import { NETCODE } from "../../shared/room/netcode";
import { NameMessage } from "../../shared/room/player";
import { JoinRoomErrorMessage, RoomPlayersMessage } from "../../shared/room/playerRegistry";
import {
    GetRoomStatusServerMessage,
    RoomJoinMessage,
    RoomKeyMessage,
    RoomOptions,
    RoomOptionsMessage,
} from "../../shared/room/roomOptions";
import { randomStr } from "../../shared/util";
import { Sanitizer } from "../../shared/util/sanitizer";
import { Server } from "../netcode/server";
import { getMatchingRoom } from "./matcher";
import { ServerPlayer } from "./serverPlayer";
import { ServerRoom } from "./serverRoom";

export class ServerRoomManager {
    private rooms: ServerRoom[];

    constructor(public server: Server) {
        this.rooms = [];
        this.bindEvents();
    }

    destruct(): void {
        this.removeAllRooms();
        this.server.emitter.removeAllListeners(NETCODE.PLAYER_NAME);
        this.server.emitter.removeAllListeners(NETCODE.ROOM_STATUS_SERVER);
        this.server.emitter.removeAllListeners(NETCODE.ROOM_JOIN_KEY);
        this.server.emitter.removeAllListeners(NETCODE.ROOM_JOIN_MATCHING);
    }

    bindEvents(): void {
        this.server.emitter.on(
            NETCODE.PLAYER_NAME,
            (player: ServerPlayer, message: NameMessage) => {
                player.name = message.name;
            },
        );

        // Get status with intent to join.
        this.server.emitter.on(
            NETCODE.ROOM_STATUS_SERVER,
            (player: ServerPlayer, message: GetRoomStatusServerMessage) => {
                const status = this.getRoomStatus(message.key);
                if (status === ROOM_STATUS.JOINABLE) {
                    const room = this.getRoomByKey(message.key);
                    player.send(new RoomKeyMessage(room.key));
                    player.send(new RoomOptionsMessage(room.options));
                    player.send(new RoomPlayersMessage(room.players, player));
                } else {
                    player.send(new JoinRoomErrorMessage(status));
                }
            },
        );

        // Join room by key.
        this.server.emitter.on(
            NETCODE.ROOM_JOIN_KEY,
            (player: ServerPlayer, message: RoomJoinMessage) => {
                const status = this.getRoomStatus(message.key);
                if (status === ROOM_STATUS.JOINABLE) {
                    this.joinRoom(player, this.getRoomByKey(message.key));
                } else {
                    player.send(new JoinRoomErrorMessage(status));
                }
            },
        );

        // Join any room matching user's preferences,
        // if no matching room is found, create a new room.
        this.server.emitter.on(
            NETCODE.ROOM_JOIN_MATCHING,
            (player: ServerPlayer, message: RoomOptionsMessage) => {
                const matchingRoom = getMatchingRoom(this.rooms, message.options);
                const room = matchingRoom || this.createRoom(message.options);
                this.joinRoom(player, room);
            },
        );
    }

    joinRoom(player: ServerPlayer, room: ServerRoom): void {
        player.room = room;
        room.addPlayer(player);
        room.emitAll(player);
        room.detectAutostart();
    }

    remove(room: ServerRoom): void {
        room.destruct();
        for (let i = 0, m = this.rooms.length; i < m; i++) {
            if (room === this.rooms[i]) {
                this.rooms.splice(i, 1);
            }
        }
    }

    removeAllRooms(): void {
        for (let i = 0, m = this.rooms.length; i < m; i++) {
            this.rooms[i].destruct();
        }
        this.rooms.length = 0;
    }

    createRoom(options: RoomOptions): ServerRoom {
        const room = new ServerRoom(this.server, options, randomStr(ROOM_KEY_LENGTH));
        this.rooms.push(room);
        return room;
    }

    // autojoinRoom(dirtyKeyArr: UntrustedData, player: ServerPlayer): void {
    //     const key = this.getSanitizedRoomKey(dirtyKeyArr);
    //     const status = this.getRoomStatus(key);
    //
    //     if (status === ROOM_STATUS.JOINABLE) {
    //         const room = this.getRoomByKey(key);
    //         room.addPlayer(player);
    //         player.send(RoomRoundMessage.fromRound(room.rounds.round));
    //         room.detectAutostart();
    //     } else {
    //         player.send(new JoinRoomErrorMessage(status));
    //     }
    // }

    getRoomByKey(key: string): ServerRoom | undefined {
        for (let i = 0, m = this.rooms.length; i < m; i++) {
            if (key === this.rooms[i].key) {
                return this.rooms[i];
            }
        }
    }

    getSanitizedRoomKey(dirtyKeyArr: UntrustedData): string {
        const keySanitizer = new Sanitizer(dirtyKeyArr[0]);
        keySanitizer.assertStringOfLength(ROOM_KEY_LENGTH);
        return keySanitizer.getValueOr() as string;
    }

    getRoomStatus(key: string): number {
        if (typeof key != "string" || key.length !== ROOM_KEY_LENGTH) {
            return ROOM_STATUS.INVALID_KEY;
        }

        const room = this.getRoomByKey(key);

        if (!room) {
            return ROOM_STATUS.NOT_FOUND;
        }

        if (room.isFull()) {
            return ROOM_STATUS.FULL;
        }

        if (room.rounds.hasStarted()) {
            return ROOM_STATUS.IN_PROGRESS;
        }

        return ROOM_STATUS.JOINABLE;
    }

    // emitRoomStatus(dirtyKeyArr: string[], player: ServerPlayer): void {
    //     const key = this.getSanitizedRoomKey(dirtyKeyArr);
    //     const status = this.getRoomStatus(key);
    //     if (status === ROOM_STATUS.JOINABLE) {
    //         const room = this.getRoomByKey(key);
    //         player.send(new RoomKeyMessage(room.key));
    //         player.send(new RoomOptionsMessage(room.options));
    //         player.send(new RoomPlayersMessage(room.players));
    //     } else {
    //         player.emit(NC_ROOM_JOIN_ERROR, [status]);
    //     }
    // }
}
