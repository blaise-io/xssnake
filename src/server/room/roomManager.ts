import {
    NC_PLAYERS_SERIALIZE,
    NC_ROOM_JOIN_ERROR,
    NC_ROOM_JOIN_KEY,
    NC_ROOM_JOIN_MATCHING,
    NC_ROOM_SERIALIZE,
    NC_ROOM_STATUS,
    NC_ROUND_SERIALIZE,
    ROOM_FULL,
    ROOM_IN_PROGRESS,
    ROOM_INVALID_KEY,
    ROOM_JOINABLE,
    ROOM_KEY_LENGTH,
    ROOM_NOT_FOUND,
} from "../../shared/const";
import { Player } from "../../shared/room/player";
import { randomStr } from "../../shared/util";
import { Sanitizer } from "../../shared/util/sanitizer";
import { Server } from "../netcode/server";
import { Matcher } from "./matcher";
import { ServerOptions } from "./serverOptions";
import { ServerPlayer } from "./serverPlayer";
import { ServerRoom } from "./serverRoom";

export class ServerRoomManager {
    private rooms: ServerRoom[];
    private matcher: Matcher;

    constructor(public server: Server) {
        this.rooms = [];
        this.matcher = new Matcher(this.rooms);
        this.bindEvents();
    }

    destruct(): void {
        this.removeAllRooms();
        this.matcher.destruct();
        this.server.emitter.removeAllListeners(String(NC_ROOM_STATUS));
        this.server.emitter.removeAllListeners(String(NC_ROOM_JOIN_KEY));
        this.server.emitter.removeAllListeners(String(NC_ROOM_JOIN_MATCHING));
    }

    bindEvents(): void {
        const emitter = this.server.emitter;
        emitter.on(String(NC_ROOM_STATUS), this.emitRoomStatus.bind(this));
        emitter.on(String(NC_ROOM_JOIN_KEY), this.autojoinRoom.bind(this));
        emitter.on(String(NC_ROOM_JOIN_MATCHING), this.joinMatchingRoom.bind(this));
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

    createRoom(options: ServerOptions): ServerRoom {
        const id = randomStr(ROOM_KEY_LENGTH);
        const room = new ServerRoom(this.server, options, id);
        this.rooms.push(room);
        return room;
    }

    autojoinRoom(dirtyKeyArr: UntrustedData, player: ServerPlayer): void {
        let room;
        let key;
        let status;
        key = this.getSanitizedRoomKey(dirtyKeyArr);
        status = this.getRoomStatus(key);

        if (status === ROOM_JOINABLE) {
            room = this.getRoomByKey(key);
            room.addPlayer(player);
            player.emit(NC_ROUND_SERIALIZE, room.rounds.round.serialize());
            room.detectAutostart();
        } else {
            player.emit(NC_ROOM_JOIN_ERROR, [status]);
        }
    }

    /**
     * @param {Array.<?>} dirtySerializeOptions
     * @param {room.ServerPlayer} player
     * @private
     */
    joinMatchingRoom(dirtySerializeOptions, player): void {
        let options;
        let room;
        let emitDataArr;

        emitDataArr = new Sanitizer(dirtySerializeOptions).assertArray().getValueOr([]);
        options = new ServerOptions(emitDataArr);

        room = this.matcher.getRoomMatching(options);
        room = room || this.createRoom(options);
        room.addPlayer(player);
        room.emitAll(player);
        room.detectAutostart();
    }

    getRoomByKey(key) {
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
            player.emit(NC_ROOM_SERIALIZE, room.serialize());
            player.emit(NC_OPTIONS.SERIALIZE, room.options.serialize());
            player.emit(NC_PLAYERS_SERIALIZE, room.players.serialize(player as Player));
        } else {
            player.emit(NC_ROOM_JOIN_ERROR, [status]);
        }
    }
}
