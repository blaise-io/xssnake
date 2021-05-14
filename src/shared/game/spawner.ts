import { Level } from "../level/level";
import { AnonymousPowerup, Apple, Spawnable } from "../level/spawnables";
import { eq, randomRangeFloat } from "../util";
import { Snake } from "./snake";

export class Spawner {
    private spawnables: Spawnable[] = [];
    private timers: ReturnType<typeof setTimeout>[] = [];

    constructor(
        private readonly level: Level,
        private readonly snakes: Snake[],
        private onspawn: (spawnable: Spawnable) => void,
    ) {
        if (level.settings.spawnApples) {
            this.scheduleSpawnApple();
        }
        if (level.settings.powerupsEnabled.length) {
            this.scheduleSpawnPowerup();
        }
    }

    destruct(): void {
        for (let i = 0, m = this.timers.length; i < m; i++) {
            clearTimeout(this.timers[i]);
        }
        for (let i = 0, m = this.spawnables.length; i < m; i++) {
            this.spawnables[i].destruct();
        }
        this.spawnables.length = 0;
    }

    handleSpawnHit(snake: Snake): Spawnable | undefined {
        const spawnable = this.spawnableAtCoordinate(snake.head);
        if (spawnable && spawnable.active) {
            spawnable.active = false;
            return spawnable;
        }
    }

    private snakeAtCoordinate(coordinate: Coordinate): Snake | undefined {
        for (let i = 0, m = this.snakes.length; i < m; i++) {
            if (this.snakes[i].hasCoordinate(coordinate)) {
                return this.snakes[i];
            }
        }
    }

    get newSpawnLocation(): Coordinate | undefined {
        // Try multiple times, is less logic/iterations compared to compiling a list.
        const maxAttempts = 50;
        for (let i = 0; i < maxAttempts; i++) {
            const tryCoordinate = this.level.data.empties.random();
            if (
                !this.spawnableAtCoordinate(tryCoordinate) &&
                !this.snakeAtCoordinate(tryCoordinate)
            ) {
                return tryCoordinate;
            }
        }
        console.warn("Could not get an empty location");
    }

    private spawnableAtCoordinate(coordinate: Coordinate): Spawnable | undefined {
        for (let i = 0, mm = this.spawnables.length; i < mm; i++) {
            if (eq(coordinate, this.spawnables[i].coordinate)) {
                return this.spawnables[i];
            }
        }
    }

    private scheduleSpawnApple() {
        this.timers.push(
            setTimeout(() => {
                const newSpawnLocation = this.newSpawnLocation;
                if (newSpawnLocation) {
                    const spawn = new Apple(this.level.settings, newSpawnLocation);
                    this.spawnables.push(spawn);
                    this.onspawn(spawn);
                }
            }, this.level.settings.spawnFirstAppleAfter * 1000),
        );
    }

    private scheduleSpawnPowerup() {
        this.timers.push(
            setTimeout(() => {
                const newSpawnLocation = this.newSpawnLocation;
                if (newSpawnLocation) {
                    const spawn = new AnonymousPowerup(this.level.settings, newSpawnLocation);
                    this.spawnables.push(spawn);
                    this.onspawn(spawn);

                    this.scheduleSpawnPowerup();
                }
            }, randomRangeFloat(...this.level.settings.powerupsInterval) * 1000),
        );
    }
}
