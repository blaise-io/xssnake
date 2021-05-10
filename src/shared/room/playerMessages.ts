import { AUDIENCE } from "../messages";
import { isStrOfMaxLen } from "../util/sanitizer";
import { Message, MessageId } from "./types";

export class NameMessage implements Message {
    static id: MessageId;
    static audience = AUDIENCE.SERVER_MATCHMAKING;

    constructor(public name: string) {}

    static deserialize(netcode: string): NameMessage | undefined {
        // TODO: Verify length
        return new NameMessage(netcode);
    }

    get serialized(): string {
        return this.name;
    }
}

export class ChatServerMessage implements Message {
    static id: MessageId;
    static audience = AUDIENCE.SERVER_ROOM;

    constructor(public body: string) {}

    static deserialize(netcode: string): ChatServerMessage | undefined {
        if (isStrOfMaxLen(netcode, 64)) {
            return new ChatServerMessage(netcode);
        }
    }

    get serialized(): string {
        return this.body;
    }
}

export class ChatClientMessage implements Message {
    static id: MessageId;
    static audience = AUDIENCE.CLIENT;

    constructor(public playerIndex: number, public body: string) {}

    static deserialize(netcode: string): ChatClientMessage | undefined {
        return new ChatClientMessage(+netcode.charAt(0), netcode.substring(1));
    }

    get serialized(): string {
        return this.playerIndex + this.body;
    }
}
