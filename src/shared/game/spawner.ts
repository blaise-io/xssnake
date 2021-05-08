import { Level } from "../level/level";
import { Spawnable } from "../level/spawnables";
import { Player } from "../room/player";
import { PlayerRegistry } from "../room/playerRegistry";

export class Spawner {
    private spawnAppleTimer: ReturnType<typeof setTimeout>;
    private spawns: Spawnable[] = [];

    constructor(
        private level: Level,
        private players: PlayerRegistry<Player>,
        private onspawn: (spawnable: Spawnable) => void,
    ) {
        if (level.settings.spawnFirstAppleAfter !== -1) {
            this.spawnAppleTimer = setTimeout(() => {
                // this.spawns.push(new Apple(level.settings, this.getFreeCoordinate()));
            }, level.settings.spawnFirstAppleAfter);
        }
    }

    destruct(): void {
        clearTimeout(this.spawnAppleTimer);
        for (let i = 0, m = this.spawns.length; i < m; i++) {
            this.spawns[i].destruct();
        }
        delete this.spawns;
    }
}
