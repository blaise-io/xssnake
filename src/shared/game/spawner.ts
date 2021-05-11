import { Level } from "../level/level";
import { Apple, Spawnable } from "../level/spawnables";
import { eq } from "../util";
import { Snake } from "./snake";

export class Spawner {
    private spawnAppleTimer?: ReturnType<typeof setTimeout>;
    private spawns: Spawnable[] = [];

    constructor(
        private level: Level,
        private snakes: Snake[],
        private onspawn: (spawnable: Spawnable) => void,
    ) {
        if (level.settings.spawnFirstAppleAfter !== -1) {
            this.spawnAppleTimer = setTimeout(() => {
                const newSpawnLocation = this.newSpawnLocation;
                if (newSpawnLocation) {
                    const spawn = new Apple(level.settings, newSpawnLocation);
                    this.spawns.push(spawn);
                    this.onspawn(spawn);
                }
            }, level.settings.spawnFirstAppleAfter);
        }
    }

    destruct(): void {
        if (this.spawnAppleTimer) {
            clearTimeout(this.spawnAppleTimer);
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
        // Try multiple times, is less logic/iterations versus compiling a list.
        const attempts = 50;
        for (let i = 0; i < attempts; i++) {
            const r = this.level.data.empties.random();
            for (let ii = 0, mm = this.spawns.length; ii < mm; ii++) {
                if (!eq(r, this.spawns[ii].coordinate) && !this.snakeHasCoordinate(r)) {
                    return r;
                }
            }
        }
    }
}
