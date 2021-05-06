import { SnakeUpdateClientMessage, SnakeUpdateServerMessage } from "../snakeMessages";
import { ChatClientMessage, ChatServerMessage, NameMessage } from "./player";
import { JoinRoomErrorMessage, RoomPlayersMessage } from "./playerRegistry";
import {
    GetRoomStatusServerMessage,
    RoomJoinMessage,
    RoomKeyMessage,
    RoomOptionsMessage,
} from "./roomMessages";
import { RoundCountdownMessage, RoomRoundMessage, RoundStartMessage } from "./round";

export const NETCODE_MAP = {
    [ChatClientMessage.id]: ChatClientMessage,
    [ChatServerMessage.id]: ChatServerMessage,
    [JoinRoomErrorMessage.id]: JoinRoomErrorMessage,
    [NameMessage.id]: NameMessage,
    [RoundCountdownMessage.id]: RoundCountdownMessage,
    [RoundStartMessage.id]: RoundStartMessage,
    [RoomKeyMessage.id]: RoomKeyMessage,
    [RoomOptionsMessage.id]: RoomOptionsMessage,
    [RoomPlayersMessage.id]: RoomPlayersMessage,
    [RoomRoundMessage.id]: RoomRoundMessage,
    [RoomJoinMessage.id]: RoomJoinMessage,
    [GetRoomStatusServerMessage.id]: GetRoomStatusServerMessage,
    [SnakeUpdateServerMessage.id]: SnakeUpdateServerMessage,
    [SnakeUpdateClientMessage.id]: SnakeUpdateClientMessage,
};

export const enum AUDIENCE {
    CLIENT = 1 << 0,
    SERVER_MATCHMAKING = 1 << 1,
    SERVER_MATCHMAKING_BID = CLIENT | SERVER_MATCHMAKING,
    SERVER_ROOM = 1 << 2,
    SERVER_ROOM_BID = CLIENT | SERVER_ROOM,
}

export const enum NETCODE {
    CHAT_NOTICE = "C1",
    CHAT_MESSAGE_SERVER = "C2",
    CHAT_MESSAGE_CLIENT = "C3",

    GAME_DESPAWN = "G1",
    GAME_STATE = "G2",
    GAME_SPAWN = "G3",

    OPTIONS_SERIALIZE = "O1",

    PLAYER_NAME = "P1",
    PLAYERS = "P2",

    ROOM_JOIN_KEY = "O1",
    ROOM_JOIN_MATCHING = "O2",
    ROOM_KEY = "O3",
    ROOM_MANUAL_START = "O4",
    ROOM_GET_STATUS = "O5",
    ROOM_JOIN_ERROR = "O7",

    ROUND_SERIALIZE = "R1",
    ROUND_COUNTDOWN = "R2",
    ROUND_START = "R3",
    ROUND_WRAPUP = "R4",

    SCORE_UPDATE = "S1",
    SNAKE_CRASH = "S2",
    SNAKE_SIZE = "S3",
    SNAKE_SPEED = "S4",
    SNAKE_UPDATE_SERVER = "S5",
    SNAKE_UPDATE_CLIENT = "S6",
}
