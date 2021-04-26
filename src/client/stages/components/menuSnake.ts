import { GAME_LEFT, GAME_TOP } from "../../../shared/const";
import { Level } from "../../../shared/level/level";
import { BlankLevel } from "../../../shared/levels/debug/blank";
import { Shape } from "../../../shared/shape";
import { _, noop } from "../../../shared/util";
import { ClientSnake } from "../../game/clientSnake";
import { State } from "../../state";
import { setGameTransform } from "../../ui/shapeClient";
import { zoom } from "../../ui/transformClient";
import { clientImageLoader, instruct } from "../../util/clientUtil";

export class MenuSnake {
    snake: ClientSnake;
    timeouts: number[];
    level: Level;

    constructor(level?: typeof Level) {
        this.timeouts = [];

        this.level = level ? new level() : new BlankLevel();
        this.level.load(clientImageLoader).then(() => {
            State.shapes.level = setGameTransform(new Shape(this.level.data.walls));
            this.spawnSnake();
        });
    }

    spawnSnake(): void {
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
        // this.level.destruct();
    }

    move(): void {
        const snake = this.snake;

        snake.collision = undefined;

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

export class NeuteredMenuSnake extends MenuSnake {
    spawnSnake(): void {}
}
