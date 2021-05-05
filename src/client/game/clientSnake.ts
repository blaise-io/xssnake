import { GAME_SHIFT_MAP } from "../../shared/const";
import { SnakeMove } from "../../shared/game/snakeMove";
import { Level } from "../../shared/level/level";
import { Player } from "../../shared/room/player";
import { Shape } from "../../shared/shape";
import { Snake } from "../../shared/snake";
import { NS } from "../const";
import { State } from "../state";
import { explosion, showAction, tooltipName } from "../ui/clientShapeGenerator";
import { flash, setGameTransform } from "../ui/shapeClient";
import { translateGame } from "../util/clientUtil";
import { ClientSnakeControls } from "./clientSnakeControls";

export class ClientSnake extends Snake {
    elapsed = 0;
    private exploded = false;
    private controls: ClientSnakeControls;
    private shapeKeys: { snake: string; name: string; direction: string };

    constructor(
        public index: number,
        public local: boolean,
        public name: string,
        public emitSnake: (number) => void,
        level: Level,
    ) {
        super(index, level);

        this.shapeKeys = {
            snake: NS.SNAKE + index,
            name: NS.SNAKE + "TAG" + index,
            direction: NS.SNAKE + "DIR" + index,
        };

        this.updateShape();
    }

    destruct(): void {
        // Remove any related shape.
        const keys = Object.keys(this.shapeKeys);
        for (let i = 0, m = keys.length; i < m; i++) {
            const shapeKey = this.shapeKeys[keys[i]];
            State.shapes[shapeKey] = undefined;
        }

        if (this.controls) {
            this.controls.destruct();
            this.controls = undefined;
        }
    }

    move(coordinate: Coordinate): void {
        if (this.controls) {
            this.controls.move();
        }
        super.move(coordinate);
    }

    getShape(): Shape {
        return State.shapes[this.shapeKeys.snake];
    }

    showName(): void {
        State.shapes[this.shapeKeys.name] = tooltipName(this.name, this.parts[0], this.direction);
    }

    showAction(label: string): void {
        showAction(label, this.getHead(), this.speed);
    }

    showDirection(): void {
        const shift = GAME_SHIFT_MAP[this.direction];
        const head = this.getHead();
        const shape = new Shape();

        shape.pixels.add(head[0] + shift[0], head[1] + shift[1]);
        setGameTransform(shape);
        flash(shape);

        State.shapes[this.shapeKeys.direction] = shape;
    }

    removeNameAndDirection(): void {
        State.shapes[this.shapeKeys.name] = undefined;
        State.shapes[this.shapeKeys.direction] = undefined;
    }

    addControls(): void {
        // TODO: Remove bidirectional dependency.
        this.controls = new ClientSnakeControls(this);
    }

    updateShape(): Shape {
        const shape = new Shape();
        shape.pixels.addPairs(this.parts);
        setGameTransform(shape);
        State.shapes[this.shapeKeys.snake] = shape;
        return shape;
    }

    handleNextMove(level: Level, elapsed: number, shift: Shift, players: Player[]): void {
        this.elapsed += elapsed;

        if (!this.crashed && this.elapsed >= this.speed) {
            const move = new SnakeMove(this, players, level, this.getNextPosition());

            this.elapsed -= this.speed;

            // Don't show a snake moving inside a wall, which is caused by latency.
            // Server wil issue a final verdict whether the snake truly crashed, or
            // made a turn in time.
            if (move.collision) {
                if (this.local) {
                    this.setCrashed();
                } else {
                    this.collision = move.collision;
                }
            } else if (!this.collision) {
                this.move(move.location);
                this.updateShape();
            }
        }
    }

    setCrashed(): void {
        this.crashed = true;
        if (this.controls) {
            this.controls.destruct();
        }
        if (!this.exploded) {
            for (let i = 0, m = this.parts.length; i < m; i++) {
                window.setTimeout(() => {
                    explosion(translateGame(this.parts[i]));
                }, (this.parts.length - i - 1) * 50);
            }
            delete State.shapes[this.shapeKeys.snake];
            this.exploded = true;
        }
    }

    deserialize(serializedSnake: [number, Coordinate[]]): void {
        this.direction = serializedSnake[0];
        this.parts = serializedSnake[1];
        // If server updated snake, client prediction
        // of snake crashing was incorrect.
        this.collision = undefined;
    }

    getNextPosition(): Coordinate {
        const head = this.getHead();
        if (this.controls) {
            this.direction = this.controls.getNextDirection();
        }
        const shift = GAME_SHIFT_MAP[this.direction];
        return [head[0] + shift[0], head[1] + shift[1]];
    }
}
