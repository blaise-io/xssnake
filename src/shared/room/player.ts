export class Player {
    constructor(
        public name: string,
        public connected = false,
        public local = false,
        public score = 0,
    ) {}

    destruct(): void {}
}
