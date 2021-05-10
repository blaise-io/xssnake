import { Level } from "../level/level";
import { Apple, Spawnable } from "../level/spawnables";
import { Player } from "../room/player";
import { PlayerRegistry } from "../room/playerRegistry";
import { eq } from "../util";

export class Spawner {
    private spawnAppleTimer?: ReturnType<typeof setTimeout>;
    private spawns: Spawnable[] = [];

    constructor(
        private level: Level,
        private players: PlayerRegistry<Player>,
        private onspawn: (spawnable: Spawnable) => void,
    ) {
        if (level.settings.spawnFirstAppleAfter !== -1) {
            this.spawnAppleTimer = setTimeout(() => {
                const newSpawnLocation = this.newSpawnLocation;
                if (newSpawnLocation) {
                    this.spawns.push(new Apple(level.settings, newSpawnLocation));
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

    get newSpawnLocation(): Coordinate | undefined {
        // Try multiple times, is less logic/iterations versus compiling a list.
        const attempts = 50;
        for (let i = 0; i < attempts; i++) {
            const r = this.level.data.empties.random();
            for (let ii = 0, mm = this.spawns.length; ii < mm; ii++) {
                if (!eq(r, this.spawns[ii].coordinate) && !this.players.hasCoordinate(r)) {
                    return r;
                }
            }
        }
    }
}
