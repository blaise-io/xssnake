/**
 * @typedef {Array.<Coordinate>}
 * @example [[0,0], [1,0], [2,0]]
 */

/**
 * Snake
 * @param {number} index
 * @param {level.Level} level
 * @constructor
 */
export class Snake {
    parts: any[];
    direction: any;
    size: number;
    speed: number;
    crashed: boolean;
    collision: any;
    gravity: any;

    constructor(public index, level) {
        const spawn = level.data.spawns[index];

        /** @type game.SnakeParts, head is last item */
        this.parts = [spawn.location];
        this.direction = spawn.direction;
        this.size = level.config.snakeSize;
        this.speed = level.config.snakeSpeed;

        this.crashed = false;
        this.collision = null;
        this.gravity = null;
    }

    /**
     * @param {Coordinate} position
     */
    move(position) {
        this.parts.push(position);
        this.trimParts();
    }

    /**
     * @return {Coordinate}
     */
    getHead() {
        return this.parts[this.parts.length - 1];
    }

    /**
     * @param {Coordinate} part
     * @return {boolean}
     */
    hasPartPredict(part) {
        const treshold = this.crashed ? -1 : 0;
        return (this.getPartIndex(part) > treshold);
    }

    trimParts() {
        while (this.parts.length > this.size) {
            this.parts.shift();
        }
    }

    /**
     * @param {Coordinate} part
     * @return {boolean}
     */
    hasPart(part) {
        return (-1 !== this.getPartIndex(part));
    }

    /**
     * @param {Coordinate} part
     * @return {number}
     */
    getPartIndex(part) {
        const parts = this.parts;
        for (let i = 0, m = parts.length; i < m; i++) {
            if (parts[i][0] === part[0] && parts[i][1] === part[1]) {
                return i;
            }
        }
        return -1;
    }

    /**
     * @param {Shift} shift
     */
    shiftParts(shift) {
        const x = shift[0] || 0; const y = shift[1] || 0;
        if (x || y) {
            for (let i = 0, m = this.parts.length; i < m; i++) {
                this.parts[i][0] += x;
                this.parts[i][1] += y;
            }
        }
    }

    /**
     * Head-tail switch.
     */
    reverse() {
        let dx; let dy;

        dx = this.parts[0][0] - this.parts[1][0];
        dy = this.parts[0][1] - this.parts[1][1];

        if (dx === 0) {
            this.direction = (dy === -1) ? 1 : 3;
        } else {
            this.direction = (dx === -1) ? 0 : 2;
        }

        this.parts.reverse();
    }

}
