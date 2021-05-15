import {
    SnakeCrashMessage,
    SnakeUpdateClientMessage,
    SnakeUpdateServerMessage,
} from "./game/snakeMessages";
import { SpawnHitMessage, SpawnMessage } from "./level/spawnables";
import { ChatClientMessage, ChatServerMessage, NameMessage } from "./room/playerMessages";
import { PlayersMessage } from "./room/playerRegistry";
import {
    RoomGetStatusMessage,
    RoomJoinErrorMessage,
    RoomJoinMessage,
    RoomKeyMessage,
    RoomOptionsServerMessage,
    RoomOptionsClientMessage,
    RoomManualStartMessage,
} from "./room/roomMessages";
import {
    RoundLevelMessage,
    RoundCountDownMessage,
    RoundStartMessage,
    RoundWrapupMessage,
} from "./room/roundMessages";
import { MessageConstructor, MessageId } from "./room/types";

export const NETCODE_MAP: Record<MessageId, MessageConstructor> = Object.fromEntries([
    ["C1", ChatClientMessage],
    ["C2", ChatServerMessage],

    ["NM", NameMessage],

    ["PS", PlayersMessage],

    ["RG", RoomGetStatusMessage],
    ["RE", RoomJoinErrorMessage],
    ["RJ", RoomJoinMessage],
    ["RK", RoomKeyMessage],
    ["RS", RoomManualStartMessage],
    ["RO", RoomOptionsServerMessage],
    ["R0", RoomOptionsClientMessage],

    ["1R", RoundLevelMessage],
    ["#R", RoundCountDownMessage],
    ["SR", RoundStartMessage],
    ["WR", RoundWrapupMessage],

    // ["#1", ScoreMessage],

    ["S<", SnakeUpdateClientMessage],
    ["S>", SnakeUpdateServerMessage],
    ["SC", SnakeCrashMessage],

    ["S?", SpawnMessage],
    ["S!", SpawnHitMessage],
]);

for (const k in NETCODE_MAP) {
    NETCODE_MAP[k].id = k;
}

export const enum AUDIENCE {
    CLIENT, // Send to client.
    SERVER_MATCHMAKING, // Send to server matchmaking, before the player is in a room.
    SERVER_ROOM, // Send to room with other players.
}
