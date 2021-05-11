import { levelSets } from "../../shared/levelSet/levelSets";
import { getRandomLevelIndex, LevelSet } from "../../shared/levelSet/levelSet";

export class LevelPlayset {
    private played: number[] = [];

    constructor(public levelSetIndex: number) {}

    destruct(): void {}

    get levelSet(): LevelSet {
        return levelSets[this.levelSetIndex];
    }

    get nextLevelIndex(): number {
        const nextLevelsetIndex = getRandomLevelIndex(this.levelSet, this.played);
        this.played.push(nextLevelsetIndex);
        return nextLevelsetIndex;
    }
}
