/**
 * @param {number} index
 * @param {boolean} local
 * @param {string} name
 * @param {level.Level} level
 * @extends {game.Snake}
 * @constructor
 */
import { GAME_SHIFT_MAP, NC_SNAKE_UPDATE, NETCODE_SYNC_MS } from "../../shared/const";
import { SnakeMove } from "../../shared/game/snakeMove";
import { Level } from "../../shared/level/level";
import { Player } from "../../shared/room/player";
import { Shape } from "../../shared/shape";
import { Snake } from "../../shared/snake";
import { FRAME, NS_SNAKE } from "../const";
import { State } from "../state/state";
import { explosion, showAction, tooltipName } from "../ui/clientShapeGenerator";
import { flash, lifetime, setGameTransform } from "../ui/shapeClient";
import { translateGame } from "../util/clientUtil";
import { ClientSnakeControls } from "./clientSnakeControls";

export class ClientSnake extends Snake {
    elapsed: number;
    private exploded: boolean;
    private controls: ClientSnakeControls;
    private shapeKeys: { snake: string; name: string; direction: string };

    constructor(public index, public local, public name, level) {
        super(index, level);

        this.elapsed = 0;
        this.exploded = false;

        this.controls = null;

        /** @type {Object.<string,string>} */
        this.shapeKeys = {
            snake: NS_SNAKE + index,
            name: NS_SNAKE + "TAG" + index,
            direction: NS_SNAKE + "DIR" + index,
        };

        this.updateShape();
    }

    destruct() {
        // Remove any related shape.
        const keys = Object.keys(this.shapeKeys);
        for (let i = 0, m = keys.length; i < m; i++) {
            const shapeKey = this.shapeKeys[keys[i]];
            State.shapes[shapeKey] = null;
        }

        if (this.controls) {
            this.controls.destruct();
            this.controls = null;
        }
    }

    move(coordinate) {
        if (this.controls) {
            this.controls.move();
        }
        super.move(coordinate);
    }

    getShape() {
        return State.shapes[this.shapeKeys.snake];
    }

    showName() {
        State.shapes[this.shapeKeys.name] = tooltipName(this.name, this.parts[0], this.direction);
    }

    showAction(label) {
        showAction(label, this.getHead(), this.speed);
    }

    showDirection() {
        let shift;
        let head;
        let shape;
        shift = GAME_SHIFT_MAP[this.direction];
        head = this.getHead();

        shape = new Shape();
        shape.pixels.add(head[0] + shift[0], head[1] + shift[1]);
        setGameTransform(shape);
        flash(shape);

        State.shapes[this.shapeKeys.direction] = shape;
    }

    removeNameAndDirection() {
        State.shapes[this.shapeKeys.name] = null;
        State.shapes[this.shapeKeys.direction] = null;
    }

    addControls() {
        this.controls = new ClientSnakeControls(this);
    }

    /**
     * @return {Shape}
     */
    updateShape() {
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

    /**
     * @param {Coordinate=} crashingPart
     */
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
        this.collision = null;
    }

    emit(direction: number): void {
        if (State.player) {
            const sync = Math.round(NETCODE_SYNC_MS / this.speed);
            State.player.emit(NC_SNAKE_UPDATE, [direction, this.parts.slice(-sync)]);
        }
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
