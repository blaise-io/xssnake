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
export class Gravity {
    progress: Shift;

    constructor(public gravity = [0, 0]) {
        this.progress = [0, 0];
    }

    getShift(elapsed: number): Shift {
        return [
            this.updateInDirection(elapsed, 0),
            this.updateInDirection(elapsed, 1),
        ];
    }

    updateInDirection(delta: number, direction: number): number {
        if (this.gravity[direction]) {
            const treshold = 1000 / Math.abs(this.gravity[direction]);
            this.progress[direction] += delta;
            if (this.progress[direction] > treshold) {
                this.progress[direction] -= treshold;
                return this.gravity[direction] > 0 ? 1 : -1;
            }
        }
        return 0;
    }
}
