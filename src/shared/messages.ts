import { ScoreMessage } from "./game/scoreMessages";
import {
    SnakeCrashMessage,
    SnakeUpdateClientMessage,
    SnakeUpdateServerMessage,
} from "./game/snakeMessages";
import { ChatClientMessage, ChatServerMessage, NameMessage } from "./room/playerMessages";
import { PlayersMessage } from "./room/playerRegistry";
import {
    RoomGetStatusMessage,
    RoomJoinErrorMessage,
    RoomJoinMessage,
    RoomKeyMessage,
    RoomOptionsMessage,
} from "./room/roomMessages";
import {
    RoundMessage,
    RoundCountdownMessage,
    RoundStartMessage,
    RoundWrapupMessage,
} from "./room/roundMessages";
import { MessageConstructor, MessageId } from "./room/types";

export const NETCODE_MAP = Object.fromEntries([
    ["C1", ChatClientMessage],
    ["C2", ChatServerMessage],

    ["N1", NameMessage],

    ["P1", PlayersMessage],

    ["R1", RoundMessage],
    ["R2", RoundCountdownMessage],
    ["R3", RoundStartMessage],
    ["R4", RoundWrapupMessage],

    ["O1", RoomGetStatusMessage],
    ["O2", RoomJoinErrorMessage],
    ["O3", RoomJoinMessage],
    ["O4", RoomKeyMessage],
    ["O5", RoomOptionsMessage],

    ["S1", ScoreMessage],

    ["U1", SnakeUpdateClientMessage],
    ["U2", SnakeUpdateServerMessage],
    ["U3", SnakeCrashMessage],
]);

Object.entries(NETCODE_MAP).forEach((netcodeEntry: [MessageId, MessageConstructor]) => {
    netcodeEntry[1].id = netcodeEntry[0];
});

export const enum AUDIENCE {
    CLIENT, // Send to client.
    SERVER_MATCHMAKING, // Send to server matchmaking, before the player is in a room.
    SERVER_ROOM, // Send to room with other players.
}
