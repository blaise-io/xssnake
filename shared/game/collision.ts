/**
 * @param {Coordinate} part
 * @param {number} into
 * @constructor
 */
export class Collision {
    private tick: number;

    constructor(public location, public into) {
        this.tick = 0;
    }

    serialize() {
        return this.location;
    }

}
