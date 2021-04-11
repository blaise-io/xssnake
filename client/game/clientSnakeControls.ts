import { DOM_EVENT_KEYDOWN, KEY_TO_DIRECTION, NS_SNAKE_CONTROLS } from "../const";
import { ClientState } from "../state/clientState";
import { ClientSnake } from "./clientSnake";

export class ClientSnakeControls {
    private upcomingDirections: number[] = [];

    constructor(public snake: ClientSnake) {
        this.bindEvents();
    }

    destruct(): void {
        ClientState.events.off(DOM_EVENT_KEYDOWN, NS_SNAKE_CONTROLS);
    }

    bindEvents(): void {
        ClientState.events.on(DOM_EVENT_KEYDOWN, NS_SNAKE_CONTROLS, this.handleKeys.bind(this));
    }

    handleKeys(event: KeyboardEvent): void {
        const direction = KEY_TO_DIRECTION[event.keyCode];
        if (!ClientState.keysBlocked && typeof direction !== "undefined") {
            this.setDirection(direction);
        }
    }

    setDirection(direction: number): void {
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

    isDirectionAllowed(direction: number, prevDirection: number): boolean {
        const turn = Math.abs(direction - prevDirection);
        return (
            this.upcomingDirections.length <= 2 &&
            this.snake.parts.length >= 2 && // Must go to blinkie at start.
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

    emitNewDirection(direction: number): void {
        //        if (State.player && State.player.room && State.player.room.gameHasStarted()) {
        this.snake.emit(direction);
        //        }
    }

    move(): void {
        if (this.upcomingDirections.length) {
            this.emitNewDirection(this.upcomingDirections.shift());
        }
    }
}
