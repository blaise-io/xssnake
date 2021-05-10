import { GAME } from "../../../shared/const";
import { Level } from "../../../shared/level/level";
import { Shape } from "../../../shared/shape";
import { _, noop } from "../../../shared/util";
import { ClientSnake } from "../../game/clientSnake";
import { State } from "../../state";
import { zoom } from "../../ui/transformClient";
import { instruct } from "../../util/clientUtil";

export class MenuSnake {
    private snake: ClientSnake;
    private timeouts: number[] = [];

    constructor(private level: Level) {
        this.snake = new ClientSnake(0, false, "", noop, this.level);
        this.snake.addControls();
        this.snake.showDirection();
        this.snake.removeNameAndDirection();
        this.timeouts.push(window.setTimeout(() => this.move(), 1500));
    }

    destruct(): void {
        for (let i = 0, m = this.timeouts.length; i < m; i++) {
            clearTimeout(this.timeouts[i]);
        }
        this.snake.destruct();
    }

    move(): void {
        const snake = this.snake;
        delete snake.collision;

        const nextpos = snake.getNextPosition();
        if (this.isCrash(snake, nextpos)) {
            snake.setCrashed();
            instruct(_("Have you seen my snake?"));
            this.timeouts.push(window.setTimeout(snake.destruct.bind(snake), 2200));
        } else {
            snake.elapsed = 1000; // Trigger move.
            snake.move(snake.getNextPosition());
            snake.updateShape();
            this.timeouts.push(window.setTimeout(this.move.bind(this), 100));
        }
    }

    isCrash(snake: ClientSnake, nextpos: Coordinate): boolean {
        const snakeShape = snake.getShape();
        let crash = false;
        if (nextpos[0] < 0 || nextpos[1] < 0) {
            return true;
        } else if (snakeShape) {
            const pixels = zoom(4, snakeShape.pixels, GAME.LEFT, GAME.TOP, false);
            pixels.each((x: number, y: number) => {
                if (this.overlaysShape(snakeShape, x, y)) {
                    crash = true;
                }
            });
        }
        return crash;
    }

    overlaysShape(snakeShape: Shape, x: number, y: number): boolean {
        for (const k in State.shapes) {
            if (State.shapes[k] !== snakeShape) {
                if (State.shapes[k] && State.shapes[k].pixels.has(x, y)) {
                    return true;
                }
            }
        }
        return false;
    }
}
