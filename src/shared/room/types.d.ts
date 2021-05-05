import { AUDIENCE, NETCODE } from "./netcode";

export interface Message {
    netcode: string;
}

export interface MessageConstructor {
    new (...any): Message;
    id: NETCODE;
    audience: AUDIENCE;
    fromNetcode: (untrustedNetcode: string) => Message;
}
