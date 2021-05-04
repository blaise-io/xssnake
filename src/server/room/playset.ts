import { levelSets } from "../../shared/levelSet/levelSets";
import { getRandomLevelIndex, LevelSet } from "../../shared/levelSet/levelSet";

export class LevelPlayset {
    private played: number[];
    private levelSet: LevelSet;

    constructor(public levelSetIndex: number) {
        this.levelSet = levelSets[levelSetIndex];
        this.played = [];
    }

    destruct(): void {
        this.levelSet = undefined;
        this.played = undefined;
    }

    getNext(): number {
        const nextLevelsetIndex = getRandomLevelIndex(this.levelSet, this.played);
        this.played.push(nextLevelsetIndex);
        return nextLevelsetIndex;
    }
}
