export class Collision {
    tick: number;

    constructor(public location: Coordinate, public into: number) {
        this.tick = 0;
    }

    serialize(): Coordinate {
        return this.location;
    }
}
