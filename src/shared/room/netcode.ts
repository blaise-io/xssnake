import { SnakeMessage } from "../snake";
import { NameMessage } from "./player";
import { AUDIENCE } from "./roomOptions";

export const enum NETCODE_ID {
    CRASH = "c",
    NAME = "n",
    ROOM = "r",
    SNAKE = "s",
    PING = "p",
    XSS = "x",
}

export const NETCODE_MAP = {
    [SnakeMessage.id]: SnakeMessage,
    [NameMessage.id]: NameMessage,
};

export interface MessageConstructor {
    new (...any): Message;
    id: NETCODE_ID;
    audience: AUDIENCE;

    fromTrustedNetcode: () => Message;
    fromUntrustedNetcode: () => Message;
}

export interface Message {
    netcode: string;
}
