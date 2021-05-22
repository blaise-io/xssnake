import { levelSets } from "./levelSets";
import { LevelSet } from "./levelSet";
import { getRandomItemFrom } from "../util";

export class LevelsPlayed {
    private played: number[] = [];

    constructor(public levelSetIndex: number) {}

    destruct(): void {}

    get nextLevelIndex(): number {
        const nextLevelsetIndex = this.getRandomLevelIndex(this.levelSet);
        this.played.push(nextLevelsetIndex);
        return nextLevelsetIndex;
    }

    private get levelSet(): LevelSet {
        return levelSets[this.levelSetIndex];
    }

    private getRandomLevelIndex(levelSet: LevelSet): number {
        if (this.played.length === this.levelSet.length) {
            this.played.length = 0;
        }
        const unPlayedLevel = getRandomItemFrom(
            levelSet.filter((level, index) => {
                return this.played.indexOf(index) === -1;
            }),
        );
        return this.levelSet.indexOf(unPlayedLevel);
    }
}
