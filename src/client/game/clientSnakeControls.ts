import { DIRECTION } from "../../shared/const";
import { KEY, NS } from "../const";
import { State } from "../state";
import { ClientSnake } from "./clientSnake";

const KEY_TO_DIRECTION = Object.fromEntries([
    [KEY.LEFT, DIRECTION.LEFT],
    [KEY.UP, DIRECTION.UP],
    [KEY.RIGHT, DIRECTION.RIGHT],
    [KEY.DOWN, DIRECTION.DOWN],
]);

export class ClientSnakeControls {
    private upcomingDirections: number[] = [];

    constructor(public snake: ClientSnake) {
        State.events.on("keydown", NS.SNAKE_CONTROLS, (event) => {
            const direction = KEY_TO_DIRECTION[event.key];
            if (!State.keysBlocked && typeof direction !== "undefined") {
                this.setDirection(direction);
            }
        });
    }

    destruct(): void {
        State.events.off("keydown", NS.SNAKE_CONTROLS);
        // delete this.snake;
    }

    setDirection(direction: DIRECTION): void {
        if (this.isDirectionAllowed(direction, this.getPreviousDirection())) {
            this.upcomingDirections.push(direction);
        }
    }

    getPreviousDirection(): number {
        if (this.upcomingDirections.length) {
            return this.upcomingDirections[0];
        }
        return this.snake.direction;
    }

    isDirectionAllowed(direction: DIRECTION, prevDirection: number): boolean {
        const turn = Math.abs(direction - prevDirection);
        return (
            this.upcomingDirections.length <= 2 &&
            this.snake.parts.length >= 2 && // Must go to direction pixel at start.
            turn !== 0 &&
            turn !== 2 // No turn and 180 turn not allowed.
        );
    }

    getNextDirection(): number {
        if (this.upcomingDirections.length) {
            this.snake.direction = this.upcomingDirections[0];
        }
        return this.snake.direction;
    }

    move(): void {
        if (this.upcomingDirections.length && this.snake.emitSnake) {
            this.snake.emitSnake(this.upcomingDirections.shift());
        }
    }
}
