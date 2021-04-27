import { Snake } from "../snake";
import { Message, NETCODE_ID } from "./netcode";
import { Audience } from "./roomOptions";

export class NameMessage implements Message {
    static id = NETCODE_ID.NAME;

    audience = Audience.SERVER;

    constructor(public name: string) {}

    static from(name: string): NameMessage {
        return new NameMessage(name);
    }

    static fromTrustedNetcode(netcode: string): NameMessage {
        return new NameMessage(netcode);
    }

    static fromUntrustedNetcode(netcode: string): NameMessage | undefined {
        if (typeof netcode === "string") {
            return new NameMessage(netcode);
        }
    }

    get netcode(): string {
        return this.name;
    }
}

export class Player {
    connected: boolean;
    score: number;
    snake: Snake;
    local: boolean;

    constructor(public name = "") {
        this.connected = false;
        this.score = 0;
        this.snake = undefined;
    }

    deserialize(serialized: [string, number]): void {
        let byte;
        [this.name, byte] = serialized;
        this.connected = Boolean((byte & 1) >> 0);
        this.local = Boolean((byte & 2) >> 1);
        this.score = byte >> 2;
    }

    serialize(local: boolean): [string, number] {
        return [
            this.name,
            (Number(this.connected) << 0) | (Number(local) << 1) | (this.score << 2),
        ];
    }
}
