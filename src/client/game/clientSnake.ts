import { GAME_SHIFT_MAP } from "../../shared/const";
import { SnakeMove } from "../../shared/game/snakeMove";
import { Level } from "../../shared/level/level";
import { Player } from "../../shared/room/player";
import { Shape } from "../../shared/shape";
import { Snake } from "../../shared/snake";
import { FRAME, NS } from "../const";
import { State } from "../state";
import { explosion, showAction, tooltipName } from "../ui/clientShapeGenerator";
import { flash, lifetime, setGameTransform } from "../ui/shapeClient";
import { translateGame } from "../util/clientUtil";
import { ClientSnakeControls } from "./clientSnakeControls";

export class ClientSnake extends Snake {
    elapsed: number;
    private exploded: boolean;
    private controls: ClientSnakeControls;
    private shapeKeys: { snake: string; name: string; direction: string };

    constructor(
        public index: number,
        public local: boolean,
        public name: string,
        public emitFunction: (number) => void,
        level: Level,
    ) {
        super(index, level);

        this.elapsed = 0;
        this.exploded = false;

        this.controls = undefined;

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
                    this.setCrashed(move.collision.location);
                } else {
                    this.collision = move.collision;
                }
            } else if (!this.collision) {
                this.move(move.location);
                this.updateShape();
            }
        }
    }

    setCrashed(crashingPart?: Coordinate): void {
        this.crashed = true;
        if (this.controls) {
            this.controls.destruct();
        }
        if (!this.exploded) {
            this.exploded = true;
            this.explodeParticles(crashingPart);
            const shape = this.updateShape();
            lifetime(shape, 0, FRAME * 50);
            flash(shape, FRAME * 5, FRAME * 10);
        }
    }

    // TODO: pass direction instead.
    explodeParticles(collisionPart?: Coordinate): void {
        let direction;

        if (collisionPart) {
            // Crashed part is specified.
            direction = -1;
        } else {
            // Assume head has crashed.
            direction = this.direction;
            collisionPart = this.getHead();
        }

        const location = translateGame(collisionPart);
        location[0] += 1;
        location[1] += 2;

        explosion(location, direction);
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
