import { SnakeMessage } from "../snake";
import { NameMessage } from "./player";
import { JoinRoomErrorMessage, RoomPlayersMessage } from "./playerRegistry";
import { RoomKeyMessage, RoomOptionsMessage } from "./roomOptions";

export const enum AUDIENCE {
    CLIENT = 1 << 0,
    SERVER_MATCHMAKING = 1 << 1,
    SERVER_ROOM = 1 << 2,
    SERVER = SERVER_MATCHMAKING | SERVER_ROOM,
    ALL = CLIENT | SERVER,
}

export const enum NETCODE {
    CHAT_NOTICE = "C1",
    CHAT_MESSAGE = "C2",

    GAME_DESPAWN = "G1",
    GAME_STATE = "G2",
    GAME_SPAWN = "G3",

    OPTIONS_SERIALIZE = "O1",

    PLAYER_NAME = "P1",
    PLAYERS_SERIALIZE = "P2",

    ROOM_JOIN_KEY = "O1",
    ROOM_JOIN_MATCHING = "O2",
    ROOM_KEY = "O3",
    ROOM_START = "O4",
    ROOM_GET_STATUS = "O5",
    ROOM_JOIN_ERROR = "O6",
    ROOM_PLAYERS = "O7",

    ROUND_SERIALIZE = "R1",
    ROUND_COUNTDOWN = "R2",
    ROUND_START = "R3",
    ROUND_WRAPUP = "R4",

    SCORE_UPDATE = "S1",
    SNAKE_CRASH = "S2",
    SNAKE_SIZE = "S3",
    SNAKE_SPEED = "S4",
    SNAKE_UPDATE = "S5",
}

export const NETCODE_MESSAGES: MessageConstructor[] = [
    JoinRoomErrorMessage,
    NameMessage,
    RoomKeyMessage,
    RoomOptionsMessage,
    RoomPlayersMessage,
    SnakeMessage,
];

export const NETCODE_MAP = Object.fromEntries(
    NETCODE_MESSAGES.map((Message) => [Message.id, Message]),
);

export interface MessageConstructor {
    new (...any): Message;
    id: NETCODE;
    audience: AUDIENCE;
    fromNetcode?: (untrustedNetcode: string) => Message;
}

export interface Message {
    netcode: string;
}
