import { Level } from "../level/level";
import { AnonymousPowerup, Apple, Spawnable } from "../level/spawnables";
import { eq, randomRange } from "../util";
import { Snake } from "./snake";

export class Spawner {
    private spawns: Spawnable[] = [];
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
        for (let i = 0, m = this.spawns.length; i < m; i++) {
            this.spawns[i].destruct();
        }
        this.spawns.length = 0;
    }

    private snakeHasCoordinate(coordinate: Coordinate): boolean {
        for (let i = 0, m = this.snakes.length; i < m; i++) {
            if (this.snakes[i].hasCoordinate(coordinate)) {
                return true;
            }
        }
        return false;
    }

    get newSpawnLocation(): Coordinate | undefined {
        // Try multiple times, is less logic/iterations compared to compiling a list.
        const maxAttempts = 50;
        for (let i = 0; i < maxAttempts; i++) {
            const randomEmptyLevel = this.level.data.empties.random();
            for (let ii = 0, mm = this.spawns.length; ii < mm; ii++) {
                if (
                    !eq(randomEmptyLevel, this.spawns[ii].coordinate) &&
                    !this.snakeHasCoordinate(randomEmptyLevel)
                ) {
                    return randomEmptyLevel;
                }
            }
        }
    }

    private scheduleSpawnApple() {
        this.timers.push(
            setTimeout(() => {
                const newSpawnLocation = this.newSpawnLocation;
                if (newSpawnLocation) {
                    const spawn = new Apple(this.level.settings, newSpawnLocation);
                    this.spawns.push(spawn);
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
                    this.spawns.push(spawn);
                    this.onspawn(spawn);

                    this.scheduleSpawnPowerup();
                }
            }, randomRange(...this.level.settings.powerupsInterval)),
        );
    }
}
