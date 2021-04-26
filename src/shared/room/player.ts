import { Snake } from "../snake";

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
