import { DIRECTION } from "../../shared/const";
import { KEY } from "../const";
import { EventHandler } from "../netcode/eventHandler";
import { State } from "../state";
import { ClientSnake } from "./clientSnake";

const KEY_TO_DIRECTION = Object.fromEntries([
    [KEY.LEFT, DIRECTION.LEFT],
    [KEY.UP, DIRECTION.UP],
    [KEY.RIGHT, DIRECTION.RIGHT],
    [KEY.DOWN, DIRECTION.DOWN],
]);

export class ClientSnakeControls {
    nextMove: number[] = [];
    private eventHandler = new EventHandler();

    constructor(public snake: ClientSnake) {
        this.eventHandler.document.on("keydown", (event: KeyboardEvent) => {
            const direction = KEY_TO_DIRECTION[event.key];
            if (!State.keysBlocked && direction !== undefined) {
                this.setDirection(direction);
            }
        });
    }

    destruct(): void {
        this.eventHandler.destruct();
    }

    setDirection(direction: DIRECTION): void {
        if (this.isDirectionAllowed(direction, this.getPreviousDirection())) {
            this.nextMove.push(direction);
        }
    }

    getPreviousDirection(): number {
        if (this.nextMove.length) {
            return this.nextMove[0];
        }
        return this.snake.direction;
    }

    isDirectionAllowed(direction: DIRECTION, prevDirection: number): boolean {
        const turn = Math.abs(direction - prevDirection);
        return (
            this.nextMove.length <= 2 &&
            this.snake.parts.length >= 2 && // Must go to direction pixel at start.
            turn !== 0 &&
            turn !== 2 // No turn and 180 turn not allowed.
        );
    }

    getNextDirection(): number {
        if (this.nextMove.length) {
            this.snake.direction = this.nextMove[0];
        }
        return this.snake.direction;
    }
}
