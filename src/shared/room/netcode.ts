import { SnakeMessage } from "../snake";
import { NameMessage } from "./player";

export const enum AUDIENCE {
    NONE = 0,
    CLIENT = 1 << 0,
    CLIENT_ROOM = 1 << 1,
    SERVER_CLIENT = 1 << 2,
    SERVER_ROOM = 1 << 3,
    SERVER_ROOM_MANAGER = 1 << 4,
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
    ROOM_SERIALIZE = "O3",
    ROOM_START = "O4",
    ROOM_STATUS = "O5",
    ROOM_JOIN_ERROR = "O6",

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

export const NETCODE_MESSAGES = [SnakeMessage, NameMessage];

export const NETCODE_MAP = Object.fromEntries(
    NETCODE_MESSAGES.map((Message: MessageConstructor) => [Message.id, Message]),
);

export interface MessageConstructor {
    new (...any): Message;
    id: NETCODE;
    audience: AUDIENCE;

    fromTrustedNetcode?: (trustedNetcode: string) => Message;
    fromUntrustedNetcode?: (untrustedNetcode: string) => Message;
}

export interface Message {
    netcode: string;
}
