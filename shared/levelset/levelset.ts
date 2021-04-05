import { Level } from "../level/level";
import { randomArrIndex } from "../util";
import { Config } from "./config";

export class Levelset {
    public title: string;
    public levels: Level[];
    public loaded: boolean;

    constructor() {
        this.title = "";
        this.levels = [];
        this.loaded = false;
    }

    getConfig(): Config {
        return new Config();
    }

    getLevel(index: number): Level {
        return this.levels[index];
    }

    register(Level) {
        this.levels.push(new Level(this.getConfig()));
    }

    preload(continueFn: Function) {
        let loaded = 0;

        const checkAllLoaded = function () {
            if (++loaded === this.levels.length) {
                continueFn();
            }
        }.bind(this);

        if (this.levels.length) {
            for (let i = 0, m = this.levels.length; i < m; i++) {
                this.levels[i].preload(checkAllLoaded);
            }
        } else {
            continueFn();
        }
    }

    getRandomLevelIndex(levelsPlayed: number[]): number {
        const notPlayed = this.levels.slice();

        if (notPlayed.length <= 1) {
            return 0;
        }

        // All levels were played.
        // Play any level except the one just played.
        if (this.levels.length === levelsPlayed.length) {
            levelsPlayed.splice(0, levelsPlayed.length - 1);
        }

        for (let i = 0, m = levelsPlayed.length; i < m; i++) {
            notPlayed.splice(levelsPlayed[i], 1);
        }

        return randomArrIndex(notPlayed);
    }
}
