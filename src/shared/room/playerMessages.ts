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

    constructor(public playerId: number, public body: string) {}

    static deserialize(netcode: string): ChatClientMessage | undefined {
        const [playerId, body] = JSON.parse(netcode);
        return new ChatClientMessage(+playerId, body);
    }

    get serialized(): string {
        return JSON.stringify([this.playerId, this.body]);
    }
}
