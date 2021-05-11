import { ROOM_STATUS, ROOM_KEY_LENGTH } from "../../shared/const";
import { NameMessage } from "../../shared/room/playerMessages";
import { PlayersMessage } from "../../shared/room/playerRegistry";
import {
    RoomGetStatusMessage,
    RoomJoinErrorMessage,
    RoomJoinMessage,
    RoomKeyMessage,
    RoomOptionsMessage,
} from "../../shared/room/roomMessages";
import { RoomOptions } from "../../shared/room/roomOptions";
import { randomStr } from "../../shared/util";
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
        this.server.emitter.removeAllListeners(NameMessage.id);
        this.server.emitter.removeAllListeners(RoomGetStatusMessage.id);
        this.server.emitter.removeAllListeners(RoomJoinMessage.id);
        this.server.emitter.removeAllListeners(RoomOptionsMessage.id);
    }

    bindEvents(): void {
        this.server.emitter.on(NameMessage.id, (player: ServerPlayer, message: NameMessage) => {
            player.name = message.name;
        });

        // Get status with intent to join.
        this.server.emitter.on(
            RoomGetStatusMessage.id,
            (player: ServerPlayer, message: RoomGetStatusMessage) => {
                const status = this.getRoomStatus(message.key);
                if (status === ROOM_STATUS.JOINABLE) {
                    const room = this.getRoomByKey(message.key) as ServerRoom;
                    player.send(new RoomKeyMessage(room.key));
                    player.send(new RoomOptionsMessage(room.options));
                    player.send(new PlayersMessage(room.players, player));
                } else {
                    player.send(new RoomJoinErrorMessage(status));
                }
            },
        );

        // Join room by key.
        this.server.emitter.on(
            RoomJoinMessage.id,
            (player: ServerPlayer, message: RoomJoinMessage) => {
                const status = this.getRoomStatus(message.key);
                if (status === ROOM_STATUS.JOINABLE) {
                    this.joinRoom(player, this.getRoomByKey(message.key) as ServerRoom);
                } else {
                    player.send(new RoomJoinErrorMessage(status));
                }
            },
        );

        // Join any room matching user's preferences,
        // if no matching room is found, create a new room.
        this.server.emitter.on(
            RoomOptionsMessage.id,
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
        room.sendInitial(player);
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
    //         player.send(RoundMessage.fromRound(room.rounds.round));
    //         room.detectAutostart();
    //     } else {
    //         player.send(new RoomJoinErrorMessage(status));
    //     }
    // }

    getRoomByKey(key: string): ServerRoom | undefined {
        for (let i = 0, m = this.rooms.length; i < m; i++) {
            if (key === this.rooms[i].key) {
                return this.rooms[i];
            }
        }
    }

    getRoomStatus(key: string): number {
        if (typeof key != "string" || key.length !== ROOM_KEY_LENGTH) {
            return ROOM_STATUS.INVALID_KEY;
        }

        const room = this.getRoomByKey(key);

        if (!room) {
            return ROOM_STATUS.NOT_FOUND;
        }

        if (room.full) {
            return ROOM_STATUS.FULL;
        }

        if (room.rounds.started) {
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
    //         player.send(new PlayersMessage(room.players));
    //     } else {
    //         player.emit(NC_ROOM_JOIN_ERROR, [status]);
    //     }
    // }
}
