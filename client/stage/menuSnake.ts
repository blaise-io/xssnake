import { BlankLevel } from "../../shared/levels/debug/blank";
import { Config } from "../../shared/levelset/config";
import { GAME_LEFT, GAME_TOP } from "../const";
import { ClientSnake } from "../game/clientSnake";
import { State } from "../state/state";
import { zoom } from "../ui/transformClient";

export class MenuSnake {
    snake: ClientSnake;
    timeouts: any[];
    level: BlankLevel;

    constructor() {
        this.snake = null;
        this.timeouts = [];
        this.level = new BlankLevel(new Config());
        this.level.preload(this.construct.bind(this));
    }

    construct() {
        const snake = new ClientSnake(0, false, "", this.level);
        snake.addControls();
        snake.showDirection();
        snake.removeNameAndDirection();

        this.snake = snake;
        this.timeouts.push(
            setTimeout(this.move.bind(this), 1500)
        );
    }

    destruct() {
        for (let i = 0, m = this.timeouts.length; i < m; i++) {
            clearTimeout(this.timeouts[i]);
        }
        this.snake.destruct();
        this.level.destruct();
    }

    move() {
        let nextpos; const snake = this.snake;

        snake.collision = null;

        nextpos = snake.getNextPosition();
        if (this.isCrash(snake, nextpos)) {
            snake.setCrashed();
            this.timeouts.push(
                setTimeout(snake.destruct.bind(snake), 2200)
            );
        } else {
            snake.elapsed = 1000; // Trigger move.
            snake.move(snake.getNextPosition());
            snake.updateShape();
            this.timeouts.push(
                setTimeout(this.move.bind(this), 100)
            );
        }
    }

    /**
     * @param {game.ClientSnake} snake
     * @param {Coordinate} nextpos
     * @return {boolean}
     */
    isCrash(snake, nextpos) {
        const snakeShape = snake.getShape(); let crash = false;
        if (nextpos[0] < 0 || nextpos[1] < 0) {
            return true;
        } else if (snakeShape) {
            const pixels = zoom(
                4, snakeShape.pixels, GAME_LEFT, GAME_TOP, false
            );
            pixels.each(function(x, y) {
                if (this.overlaysShape(snakeShape, x, y)) {
                    crash = true;
                }
            }.bind(this));
        }
        return crash;
    }

    /**
     * @param {Shape} snakeShape
     * @param {number} x
     * @param {number} y
     * @return {boolean}
     */
    overlaysShape(snakeShape, x, y) {
        for (const k in State.shapes) {
            if (State.shapes.hasOwnProperty(k) && State.shapes[k] !== snakeShape) {
                if (State.shapes[k] && State.shapes[k].pixels.has(x, y)) {
                    return true;
                }
            }
        }
        return false;
    }

}


export class NeuteredMenuSnake extends MenuSnake {
    construct(): void {
        this.snake = null;
    }
}
