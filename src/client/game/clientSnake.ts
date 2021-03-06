import { DIRECTION, GAME_SHIFT_MAP } from "../../shared/const";
import { SnakeMove } from "../../shared/game/snakeMove";
import { Level } from "../../shared/level/level";
import { Shape } from "../../shared/shape";
import { Snake } from "../../shared/game/snake";
import { NS } from "../const";
import { State } from "../state";
import { explosion, showAction, tooltipName } from "../ui/clientShapeGenerator";
import { flash, setGameTransform } from "../ui/shapeClient";
import { translateGame } from "../util/clientUtil";
import { ClientSnakeControls } from "./clientSnakeControls";

export class ClientSnake extends Snake {
    elapsed = 0;
    private exploded = false;
    private controls?: ClientSnakeControls;
    private shapeKeys: { snake: string; name: string; direction: string };

    constructor(
        playerId: number,
        spawnIndex: number,
        public local: boolean,
        public name: string,
        public emitDirection: (snake: Snake, direction: DIRECTION) => void,
        private level: Level,
    ) {
        super(
            playerId,
            level.settings.snakeSize,
            level.settings.snakeSpeed,
            level.data.spawns[spawnIndex],
        );

        this.shapeKeys = {
            snake: NS.SNAKE + playerId,
            name: NS.SNAKE + "TAG" + playerId,
            direction: NS.SNAKE + "DIR" + playerId,
        };

        this.showName();
        this.updateShape();

        if (this.local) {
            this.showDirection();
        }
    }

    destruct(): void {
        delete State.shapes[this.shapeKeys.snake];
        delete State.shapes[this.shapeKeys.name];
        delete State.shapes[this.shapeKeys.direction];
        this.controls?.destruct();
    }

    move(coordinate: Coordinate): void {
        this.hideNameAndDirection();

        if (this.controls && this.controls.nextMove.length && this.emitDirection) {
            this.emitDirection(this, this.controls.nextMove.shift() as DIRECTION);
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
        showAction(label, this.head, this.speed);
    }

    showDirection(): void {
        const shift = GAME_SHIFT_MAP[this.direction];
        const shape = new Shape();

        shape.pixels.add(this.head[0] + shift[0], this.head[1] + shift[1]);
        setGameTransform(shape);
        flash(shape);

        State.shapes[this.shapeKeys.direction] = shape;
    }

    hideNameAndDirection(): void {
        delete State.shapes[this.shapeKeys.name];
        delete State.shapes[this.shapeKeys.direction];
    }

    addControls(): void {
        this.controls = new ClientSnakeControls(this);
    }

    updateShape(): Shape {
        const shape = new Shape();
        shape.pixels.addPairs(this.parts);
        setGameTransform(shape);
        State.shapes[this.shapeKeys.snake] = shape;
        return shape;
    }

    handleNextMove(elapsed: number, shift: Shift, opponents: Snake[]): void {
        this.elapsed += elapsed;

        if (!this.crashed && this.elapsed >= this.speed) {
            const move = new SnakeMove(this, opponents, this.level, this.getNextPosition());

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
                    if (this.parts[i]) {
                        // TODO: snake may be despawned.
                        explosion(translateGame(this.parts[i]));
                    }
                }, (this.parts.length - i - 1) * 50);
            }
            delete State.shapes[this.shapeKeys.snake];
            this.exploded = true;
        }
    }

    // private deserialize(serializedSnake: [number, Coordinate[]]): void {
    //     this.direction = serializedSnake[0];
    //     this.parts = serializedSnake[1];
    //     // If server updated snake, client prediction
    //     // of snake crashing was incorrect.
    //     // delete this.collision;
    // }

    getNextPosition(): Coordinate {
        if (this.controls) {
            this.direction = this.controls.getNextDirection();
        }
        const shift = GAME_SHIFT_MAP[this.direction];
        return [this.head[0] + shift[0], this.head[1] + shift[1]];
    }
}
