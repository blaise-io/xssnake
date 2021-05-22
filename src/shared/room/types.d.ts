import { AUDIENCE } from "../messages";

export type MessageId = string;

export interface MessageConstructor {
    new (): Message;
    id: MessageId;
    audience: AUDIENCE;
    deserialize: (untrustedNetcode: string) => Message;
}

export interface Message {
    serialized: string;
}
