import { Snake } from "../snake";
import { isStrOfMaxLen } from "../util/sanitizer";
import { AUDIENCE, NETCODE } from "./netcode";
import { Message } from "./types";

export class NameMessage implements Message {
    static id = NETCODE.PLAYER_NAME;
    static audience = AUDIENCE.SERVER_MATCHMAKING;

    constructor(public name: string) {}

    static fromNetcode(netcode: string): NameMessage | undefined {
        // TODO: Verify length
        return new NameMessage(netcode);
    }

    get netcode(): string {
        return this.name;
    }
}

export class ChatServerMessage implements Message {
    static id = NETCODE.CHAT_MESSAGE_SERVER;
    static audience = AUDIENCE.SERVER_ROOM;

    constructor(public body: string) {}

    static fromNetcode(netcode: string): ChatServerMessage | undefined {
        if (isStrOfMaxLen(netcode, 64)) {
            return new ChatServerMessage(netcode);
        }
    }

    get netcode(): string {
        return this.body;
    }
}

export class ChatClientMessage implements Message {
    static id = NETCODE.CHAT_MESSAGE_CLIENT;
    static audience = AUDIENCE.CLIENT;

    constructor(public playerIndex: number, public body: string) {}

    static fromNetcode(netcode: string): ChatClientMessage | undefined {
        return new ChatClientMessage(parseInt(netcode.charAt(0), 10), netcode.substring(1));
    }

    get netcode(): string {
        return this.playerIndex + this.body;
    }
}

export class Player {
    constructor(
        public name = "",
        public connected = false,
        public local = false,
        public score = 0,
        public snake?: Snake,
    ) {}

    destruct(): void {
        delete this.snake;
    }

    // /** @deprecated */
    // deserialize(serialized: [string, number]): void {
    //     let byte;
    //     [this.name, byte] = serialized;
    //     this.connected = Boolean((byte & 1) >> 0);
    //     this.local = Boolean((byte & 2) >> 1);
    //     this.score = byte >> 2;
    // }

    // /** @deprecated */
    // serialize(local: boolean): [string, number] {
    //     return [
    //         this.name,
    //         (Number(this.connected) << 0) | (Number(local) << 1) | (this.score << 2),
    //     ];
    // }
}
