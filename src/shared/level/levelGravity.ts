/**
 * Gravity pulls snakes and power-ups a certain direction.
 *
 * gravity is an array with two numbers. The first number is tiles per second to
 * the left or right, second number is tiles per second up or down.
 *
 * Example 1: [-5, -5] pulls objects to top-left.
 * Example 2: [5, 5] pulls objects to bottom-right.
 * Example 2: [-5, 0] pulls objects to the left only.
 */
import { ORIENTATION } from "../const";

export class LevelGravity {
    progress: Shift;

    constructor(public gravity = [0, 0]) {
        this.progress = [0, 0];
    }

    getShift(elapsed: number): Shift {
        return [
            this.updateInDirection(ORIENTATION.HORIZONTAL, elapsed),
            this.updateInDirection(ORIENTATION.VERTICAL, elapsed),
        ];
    }

    updateInDirection(orientation: ORIENTATION, delta = 0): number {
        if (this.gravity[orientation]) {
            const treshold = 1000 / Math.abs(this.gravity[orientation]);
            this.progress[orientation] += delta;
            if (this.progress[orientation] > treshold) {
                this.progress[orientation] -= treshold;
                return this.gravity[orientation] > 0 ? 1 : -1;
            }
        }
        return 0;
    }
}
