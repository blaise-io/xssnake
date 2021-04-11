import { GAME_LEFT, GAME_TOP } from "../../shared/const";
import { BlankLevel } from "../../shared/levels/debug/blank";
import { Config } from "../../shared/levelset/config";
import { Shape } from "../../shared/shape";
import { ClientSnake } from "../game/clientSnake";
import { ClientState } from "../state/clientState";
import { zoom } from "../ui/transformClient";
import { instruct } from "../util/clientUtil";

export class MenuSnake {
    snake: ClientSnake;
    timeouts: number[];
    level: BlankLevel;

    constructor() {
        this.snake = null;
        this.timeouts = [];
        this.level = new BlankLevel(new Config());
        this.level.preload(this.construct.bind(this));
    }

    construct(): void {
        const snake = new ClientSnake(0, false, "", this.level);
        snake.addControls();
        snake.showDirection();
        snake.removeNameAndDirection();

        this.snake = snake;
        this.timeouts.push(window.setTimeout(this.move.bind(this), 1500));
    }

    destruct(): void {
        for (let i = 0, m = this.timeouts.length; i < m; i++) {
            clearTimeout(this.timeouts[i]);
        }
        this.snake.destruct();
        this.level.destruct();
    }

    move(): void {
        const snake = this.snake;

        snake.collision = null;

        const nextpos = snake.getNextPosition();
        if (this.isCrash(snake, nextpos)) {
            snake.setCrashed();
            instruct("Have you seen my snake?");
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
            const pixels = zoom(4, snakeShape.pixels, GAME_LEFT, GAME_TOP, false);
            pixels.each(
                function (x, y) {
                    if (this.overlaysShape(snakeShape, x, y)) {
                        crash = true;
                    }
                }.bind(this)
            );
        }
        return crash;
    }

    overlaysShape(snakeShape: Shape, x: number, y: number): boolean {
        for (const k in ClientState.shapes) {
            if (ClientState.shapes[k] !== snakeShape) {
                if (ClientState.shapes[k] && ClientState.shapes[k].pixels.has(x, y)) {
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
