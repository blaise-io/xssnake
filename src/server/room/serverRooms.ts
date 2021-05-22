import { EventEmitter } from "events";
import { ROOM_STATUS } from "../../shared/const";
import { NameMessage } from "../../shared/room/playerMessages";
import { PlayersMessage } from "../../shared/room/playerRegistry";
import {
    RoomGetStatusMessage,
    RoomJoinErrorMessage,
    RoomJoinMessage,
    RoomOptionsClientMessage,
    RoomOptionsServerMessage,
} from "../../shared/room/roomMessages";
import { getMatchingRoom } from "./matching";
import { ServerPlayer } from "./serverPlayer";
import { ServerRoom } from "./serverRoom";

export class ServerRooms extends Array<ServerRoom> {
    readonly emitter = new EventEmitter();

    constructor() {
        super();

        this.emitter.on(NameMessage.id, (player: ServerPlayer, message: NameMessage) => {
            player.name = message.name;
        });

        // Autojoin first displays room details while asking for name, before joining.
        this.emitter.on(
            RoomGetStatusMessage.id,
            (player: ServerPlayer, message: RoomGetStatusMessage) => {
                const room = this.byKey(message.key);
                const status = this.getRoomStatus(room);
                if (room && status === ROOM_STATUS.JOINABLE) {
                    player.send(new RoomOptionsClientMessage(room.options));
                    player.send(new PlayersMessage(room.players, player));
                } else {
                    player.send(new RoomJoinErrorMessage(status));
                }
            },
        );

        // Join room by key.
        this.emitter.on(RoomJoinMessage.id, (player: ServerPlayer, message: RoomJoinMessage) => {
            const room = this.byKey(message.key);
            const status = this.getRoomStatus(room);
            if (room && status === ROOM_STATUS.JOINABLE) {
                this.joinRoom(player, room);
            } else {
                player.send(new RoomJoinErrorMessage(status));
            }
        });

        // Join any room matching user's preferences,
        // if no matching room is found, create a new room.
        this.emitter.on(
            RoomOptionsServerMessage.id,
            (player: ServerPlayer, message: RoomOptionsServerMessage) => {
                let room = getMatchingRoom(this, message.options);
                if (!room) {
                    room = new ServerRoom(message.options);
                    this.push(room);
                }
                this.joinRoom(player, room);
            },
        );
    }

    joinRoom(player: ServerPlayer, room: ServerRoom): void {
        player.room = room;
        room.addPlayer(player);
        room.sendInitial(player);
    }

    async removePlayer(player: ServerPlayer): Promise<void> {
        if (player.room) {
            const room = await player.room.removePlayer(player);
            if (!room.players.find((p) => p.connected)) {
                const roomIndex = this.indexOf(room);
                if (roomIndex !== -1) {
                    this.splice(roomIndex, 1);
                }
                room.destruct();
            }
        }
    }

    byKey(key: string): ServerRoom | undefined {
        for (let i = 0, m = this.length; i < m; i++) {
            if (key === this[i].key) {
                return this[i];
            }
        }
    }

    getRoomStatus(room?: ServerRoom): number {
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
}
