import { Level, LevelSpawnable } from "../level/level";
import { AnonymousPowerup, Apple, SPAWN_ID, SPAWN_TYPE, Spawnable } from "../level/spawnables";
import { eq, getRandomItemFrom, noop, randomRangeFloat } from "../util";
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
            this.scheduleSpawnApple(this.level.settings.spawnFirstAppleAfter * 1000);
        }
        if (level.settings.powerupsEnabled.length) {
            this.scheduleSpawnPowerup(
                randomRangeFloat(...this.level.settings.powerupsInterval) * 1000,
            );
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
        this.onspawn = noop;
    }

    handleSpawnHit(snake: Snake): Spawnable | undefined {
        const spawnable = this.spawnableAtCoordinate(snake.head);
        if (spawnable) {
            spawnable.active = false;
            if (spawnable.type === SPAWN_TYPE.APPLE) {
                this.scheduleSpawnApple();
                return spawnable;
            } else if ((spawnable.constructor as typeof Spawnable).id === SPAWN_ID.ANONYMOUS) {
                return this.exchangeAnonymous(
                    spawnable.coordinate,
                    this.level.settings.powerupsEnabled,
                );
            }
        }
    }

    exchangeAnonymous(coordinate: Coordinate, powerups: LevelSpawnable[]): Spawnable {
        const SpawnableClass = getRandomItemFrom(powerups)[0];
        return new SpawnableClass(this.level.settings, coordinate);
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

    private spawnableAtCoordinate(coordinate: Coordinate, active = true): Spawnable | undefined {
        for (let i = 0, mm = this.spawnables.length; i < mm; i++) {
            if (
                this.spawnables[i].active === active &&
                eq(coordinate, this.spawnables[i].coordinate)
            ) {
                return this.spawnables[i];
            }
        }
    }

    private scheduleSpawnApple(delay = 0) {
        this.timers.push(
            setTimeout(() => {
                const newSpawnLocation = this.newSpawnLocation;
                if (newSpawnLocation) {
                    const spawn = new Apple(this.level.settings, newSpawnLocation);
                    this.spawnables.push(spawn);
                    this.onspawn(spawn);
                }
            }, delay),
        );
    }

    private scheduleSpawnPowerup(delay = 0) {
        this.timers.push(
            setTimeout(() => {
                const newSpawnLocation = this.newSpawnLocation;
                if (newSpawnLocation) {
                    const spawn = new AnonymousPowerup(this.level.settings, newSpawnLocation);
                    this.spawnables.push(spawn);
                    this.onspawn(spawn);

                    this.scheduleSpawnPowerup(
                        randomRangeFloat(...this.level.settings.powerupsInterval) * 1000,
                    );
                }
            }, delay),
        );
    }
}
