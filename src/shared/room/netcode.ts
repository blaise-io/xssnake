import { SnakeMessage } from "../snake";
import { NameMessage } from "./player";

export const enum NETCODE_ID {
    CRASH = "c",
    NAME = "n",
    ROOM = "r",
    SNAKE = "s",
    XSS = "x",
}

export const NETCODE_MAP = [SnakeMessage, NameMessage].map((a) => [a.id, a]);

export interface MessageConstructor {
    new (...any): Message;

    id: string;
}

export interface Message {
    netcode: string;
}
