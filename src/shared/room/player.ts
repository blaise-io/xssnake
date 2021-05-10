import { Snake } from "../game/snake";

export class Player {
    constructor(
        public name = "",
        public connected = false,
        public local = false,
        public score = 0,
        public snake?: Snake,
    ) {}

    destruct(): void {
        // delete this.snake;
    }

    // /** @deprecated */
    // deserialize(serialized: [string, number]): void {
    //     let byte;
    //     [this.name, byte] = serialized;
    //     this.connected = !!((byte & 1) >> 0);
    //     this.local = !!((byte & 2) >> 1);
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
