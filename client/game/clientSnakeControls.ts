import { DOM_EVENT_KEYDOWN, KEY_TO_DIRECTION, NS_SNAKE_CONTROLS } from "../const";
import { State } from "../state/state";
import { ClientSnake } from "./clientSnake";

export class ClientSnakeControls {
    private upcomingDirections: number[];

    constructor(public snake: ClientSnake) {
        this.bindEvents();
        // Allow buffering the next move.
        this.upcomingDirections = [];
    }

    destruct() {
        State.events.off(
            DOM_EVENT_KEYDOWN,
            NS_SNAKE_CONTROLS
        );
    }

    bindEvents() {
        State.events.on(
            DOM_EVENT_KEYDOWN,
            NS_SNAKE_CONTROLS,
            this.handleKeys.bind(this)
        );
    }

    /**
     * @param {Event} event
     */
    handleKeys(event) {
        const direction = KEY_TO_DIRECTION[event.keyCode];
        if (!State.keysBlocked && typeof direction !== "undefined") {
            this.setDirection(direction);
        }
    }

    /**
     * @param {number} direction
     */
    setDirection(direction) {
        if (this.isDirectionAllowed(direction, this.getPreviousDirection())) {
            this.upcomingDirections.push(direction);
        }
    }

    /**
     * @return {number}
     */
    getPreviousDirection() {
        if (this.upcomingDirections.length) {
            return this.upcomingDirections[0];
        }
        return this.snake.direction;
    }

    /**
     * @param {number} direction
     * @param {number} prevDirection
     * @return {boolean}
     */
    isDirectionAllowed(direction, prevDirection) {
        const turn = Math.abs(direction - prevDirection);
        return (
            this.upcomingDirections.length <= 2 &&
            this.snake.parts.length >= 2 && // Must go to blinkie at start.
            turn !== 0 && turn !== 2 // No turn and 180 turn not allowed.
        );
    }

    /**
     * @return {number}
     */
    getNextDirection() {
        if (this.upcomingDirections.length) {
            this.snake.direction = this.upcomingDirections[0];
        }
        return this.snake.direction;
    }

    /**
     * @param {number} direction
     */
    emitNewDirection(direction) {
        //        if (State.player && State.player.room && State.player.room.gameHasStarted()) {
        this.snake.emit(direction);
        //        }
    }

    /**
     * Snake moved. Administrate!
     */
    move() {
        if (this.upcomingDirections.length) {
            this.emitNewDirection(this.upcomingDirections.shift());
        }
    }

}
