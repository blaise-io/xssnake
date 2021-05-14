import { ScoreMessage } from "./game/scoreMessages";
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

    ["N1", NameMessage],

    ["P1", PlayersMessage],

    ["R1", RoomGetStatusMessage],
    ["R2", RoomJoinErrorMessage],
    ["R3", RoomJoinMessage],
    ["R4", RoomKeyMessage],
    ["R5", RoomOptionsServerMessage],
    ["R6", RoomOptionsClientMessage],

    ["1R", RoundLevelMessage],
    ["2R", RoundCountDownMessage],
    ["3R", RoundStartMessage],
    ["4R", RoundWrapupMessage],

    ["#1", ScoreMessage],

    ["S1", SnakeUpdateClientMessage],
    ["S2", SnakeUpdateServerMessage],
    ["S3", SnakeCrashMessage],

    ["1S", SpawnMessage],
    ["2S", SpawnHitMessage],
]);

for (const k in NETCODE_MAP) {
    NETCODE_MAP[k].id = k;
}

export const enum AUDIENCE {
    CLIENT, // Send to client.
    SERVER_MATCHMAKING, // Send to server matchmaking, before the player is in a room.
    SERVER_ROOM, // Send to room with other players.
}
