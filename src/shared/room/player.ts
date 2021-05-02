import { Snake } from "../snake";
import { AUDIENCE, Message, NETCODE } from "./netcode";

export class NameMessage implements Message {
    static id = NETCODE.PLAYER_NAME;
    static audience = AUDIENCE.SERVER;

    constructor(public name: string) {}

    static from(name: string): NameMessage {
        return new NameMessage(name);
    }

    static fromNetcode(netcode: string): NameMessage | undefined {
        // TODO: Verify length
        return new NameMessage(netcode);
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
