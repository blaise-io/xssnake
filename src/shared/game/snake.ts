import { DIRECTION } from "../const";
import { PlayerSpawn } from "../level/playerSpawn";
import { Collision } from "./collision";

export class Snake {
    /** Head is last in array */
    crashed = false;
    parts: Coordinate[];
    direction: DIRECTION;
    collision?: Collision;

    constructor(
        public playerId: number,
        public size: number,
        public speed: number, // TODO: Float between 1 and 10.
        spawn: PlayerSpawn,
    ) {
        this.parts = [spawn.location];
        this.direction = spawn.direction;
    }

    move(position: Coordinate): void {
        this.parts.push(position);
        this.trimParts();
    }

    get head(): Coordinate {
        return this.parts[this.parts.length - 1];
    }

    // hasPartPredict(part: Coordinate): boolean {
    //     const treshold = this.crashed ? -1 : 0;
    //     return this.getPartIndex(part) > treshold;
    // }

    trimParts(): void {
        while (this.parts.length > this.size) {
            this.parts.shift();
        }
    }

    hasCoordinate(part: Coordinate): boolean {
        return -1 !== this.getPartIndex(part);
    }

    getPartIndex(part: Coordinate): number {
        const parts = this.parts;
        for (let i = 0, m = parts.length; i < m; i++) {
            if (parts[i][0] === part[0] && parts[i][1] === part[1]) {
                return i;
            }
        }
        return -1;
    }

    shiftParts(shift: Shift): void {
        const x = shift[0];
        const y = shift[1];
        if (x !== 0 || y !== 0) {
            for (let i = 0, m = this.parts.length; i < m; i++) {
                this.parts[i][0] += x;
                this.parts[i][1] += y;
            }
        }
    }

    reverse(): void {
        // Move snake in direction of head relative to the rest of the body.
        if (this.parts.length >= 2) {
            const dx = this.parts[0][0] - this.parts[1][0];
            const dy = this.parts[0][1] - this.parts[1][1];

            if (dx === 0) {
                this.direction = dy === -1 ? 1 : 3;
            } else {
                this.direction = dx === -1 ? 0 : 2;
            }
        }

        this.parts = this.parts.slice().reverse();
    }
}
