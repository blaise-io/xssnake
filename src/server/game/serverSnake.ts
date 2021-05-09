import { GAME_SHIFT_MAP } from "../../shared/const";
import { SnakeMove } from "../../shared/game/snakeMove";
import { Level } from "../../shared/level/level";
import { Snake } from "../../shared/game/snake";
import { ServerPlayerRegistry } from "../room/serverPlayerRegistry";

export class ServerSnake extends Snake {
    private elapsed: number;
    constructor(public index: number, public level: Level) {
        super(index, level);
        this.elapsed = 0;
    }

    destruct(): void {
        // delete this.level;
    }

    serialize(): [number, number, Coordinate[]] {
        return [this.index, this.direction, this.parts];
    }

    handleNextMove(
        tick: number,
        elapsed: number,
        shift: Shift,
        players: ServerPlayerRegistry,
    ): void {
        this.elapsed += elapsed;

        if (!this.crashed && this.elapsed >= this.speed) {
            const move = new SnakeMove(this, players, this.level, this.getNextPosition());

            this.elapsed -= this.speed;

            if (!move.collision) {
                // delete this.collision;
                this.move(move.location);
            } else if (!this.collision) {
                this.collision = move.collision;
                this.collision.tick = tick;
            }
        }
    }

    getNextPosition(): Coordinate {
        const head = this.getHead();
        const shift = GAME_SHIFT_MAP[this.direction];
        return [head[0] + shift[0], head[1] + shift[1]];
    }

    hasCollisionLteTick(tick: number): boolean {
        return !this.crashed && this.collision && this.collision.tick <= tick;
    }
}
