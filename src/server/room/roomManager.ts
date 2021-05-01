import {
    NC_PLAYERS_SERIALIZE,
    NC_ROOM_JOIN_ERROR,
    NC_ROOM_JOIN_KEY,
    NC_ROOM_STATUS,
    NC_ROUND_SERIALIZE,
    ROOM_FULL,
    ROOM_IN_PROGRESS,
    ROOM_INVALID_KEY,
    ROOM_JOINABLE,
    ROOM_KEY_LENGTH,
    ROOM_NOT_FOUND,
} from "../../shared/const";
import { NETCODE } from "../../shared/room/netcode";
import { Player } from "../../shared/room/player";
import { RoomOptions, RoomOptionsMessage } from "../../shared/room/roomOptions";
import { randomStr } from "../../shared/util";
import { Sanitizer } from "../../shared/util/sanitizer";
import { Server } from "../netcode/server";
import { getMatchingRoom } from "./matcher";
import { ServerPlayer } from "./serverPlayer";
import { ServerRoom, ServerRoomMessage } from "./serverRoom";

export class ServerRoomManager {
    private rooms: ServerRoom[];

    constructor(public server: Server) {
        this.rooms = [];
        this.bindEvents();
    }

    destruct(): void {
        this.removeAllRooms();
        this.server.emitter.removeAllListeners(String(NC_ROOM_STATUS));
        this.server.emitter.removeAllListeners(String(NC_ROOM_JOIN_KEY));
        this.server.emitter.removeAllListeners(NETCODE.ROOM_JOIN_MATCHING);
    }

    bindEvents(): void {
        this.server.emitter.on(String(NC_ROOM_STATUS), this.emitRoomStatus.bind(this));
        this.server.emitter.on(String(NC_ROOM_JOIN_KEY), this.autojoinRoom.bind(this));

        this.server.emitter.on(
            NETCODE.ROOM_JOIN_MATCHING,
            (message: RoomOptionsMessage, player: ServerPlayer) => {
                const matchingRoom = getMatchingRoom(this.rooms, message.options);
                const room = matchingRoom || this.createRoom(message.options);

                room.addPlayer(player);
                room.emitAll(player);
                room.detectAutostart();
            },
        );
    }

    room(key: string): ServerRoom {
        return this.rooms[key];
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
        const id = randomStr(ROOM_KEY_LENGTH);
        const room = new ServerRoom(this.server, options, id);
        this.rooms.push(room);
        return room;
    }

    autojoinRoom(dirtyKeyArr: UntrustedData, player: ServerPlayer): void {
        const key = this.getSanitizedRoomKey(dirtyKeyArr);
        const status = this.getRoomStatus(key);

        if (status === ROOM_JOINABLE) {
            const room = this.getRoomByKey(key);
            room.addPlayer(player);
            player.emit(NC_ROUND_SERIALIZE, room.rounds.round.serialize());
            room.detectAutostart();
        } else {
            player.emit(NC_ROOM_JOIN_ERROR, [status]);
        }
    }

    getRoomByKey(key: string): ServerRoom | null {
        for (let i = 0, m = this.rooms.length; i < m; i++) {
            if (key === this.rooms[i].key) {
                return this.rooms[i];
            }
        }
        return null;
    }

    getSanitizedRoomKey(dirtyKeyArr: UntrustedData): string {
        const keySanitizer = new Sanitizer(dirtyKeyArr[0]);
        keySanitizer.assertStringOfLength(ROOM_KEY_LENGTH);
        return keySanitizer.getValueOr() as string;
    }

    getRoomStatus(key: string): number {
        if (!key) {
            return ROOM_INVALID_KEY;
        }
        const room = this.getRoomByKey(key);
        if (!room) {
            return ROOM_NOT_FOUND;
        } else if (room.isFull()) {
            return ROOM_FULL;
        } else if (room.rounds.hasStarted()) {
            return ROOM_IN_PROGRESS;
        }
        return ROOM_JOINABLE;
    }

    emitRoomStatus(dirtyKeyArr: string[], player: ServerPlayer): void {
        const key = this.getSanitizedRoomKey(dirtyKeyArr);
        const status = this.getRoomStatus(key);
        if (status === ROOM_JOINABLE) {
            const room = this.getRoomByKey(key);
            player.send(new ServerRoomMessage(room.key));
            player.send(new RoomOptionsMessage(room.options));
            player.emit(NC_PLAYERS_SERIALIZE, room.players.serialize(player as Player));
        } else {
            player.emit(NC_ROOM_JOIN_ERROR, [status]);
        }
    }
}
