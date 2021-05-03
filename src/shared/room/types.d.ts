export interface Message {
    netcode: string;
}

export interface MessageConstructor {
    new (...any): Message;

    id: import("./netcode").NETCODE;
    audience: import("./netcode").AUDIENCE;
    fromNetcode?: (untrustedNetcode: string) => Message;
}
