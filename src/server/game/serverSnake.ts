import { GAME_SHIFT_MAP } from "../../shared/const";
import { SnakeMove } from "../../shared/game/snakeMove";
import { Level } from "../../shared/level/level";
import { Snake } from "../../shared/game/snake";

export class ServerSnake extends Snake {
    private elapsed = 0;

    // Server prediction for crash may be off from client, allow client to fix within reason.
    limbo = false;

    constructor(playerId: number, index: number, public level: Level) {
        super(
            playerId,
            level.settings.snakeSize,
            level.settings.snakeSpeed,
            level.data.spawns[index],
        );
    }

    destruct(): void {}

    handleNextMove(tick: number, elapsed: number, shift: Shift, opponents: ServerSnake[]): void {
        this.elapsed += elapsed;
        if (!this.crashed && this.elapsed >= this.speed) {
            const move = new SnakeMove(this, opponents, this.level, this.getNextPosition());

            this.elapsed -= this.speed;

            if (!move.collision) {
                this.move(move.location);
                delete this.collision;
            } else if (!this.collision) {
                this.collision = move.collision;
                this.collision.tick = tick;
            }
        }
    }

    getNextPosition(): Coordinate {
        const shift = GAME_SHIFT_MAP[this.direction];
        return [this.head[0] + shift[0], this.head[1] + shift[1]];
    }

    hasCollisionLteTick(tick: number): boolean {
        return !this.crashed && !!this.collision && this.collision?.tick <= tick;
    }
}
