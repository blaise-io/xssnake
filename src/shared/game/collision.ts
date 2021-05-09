import { CRASH_INTO } from "./snakeMove";

export class Collision {
    tick: number;

    constructor(public location: Coordinate, public into: CRASH_INTO) {
        this.tick = 0;
    }

    serialize(): Coordinate {
        return this.location;
    }
}
