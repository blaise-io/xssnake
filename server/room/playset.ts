import { levelsets } from "../../shared/data/levelsets";
import { Levelset } from "../../shared/levelset/levelset";

export class LevelPlayset {
    private played: number[];
    private levelset: Levelset;

    constructor(public levelsetIndex: number) {
        this.levelset = levelsets[levelsetIndex];
        this.played = [];
    }

    destruct(): void {
        this.levelset = null;
        this.played = null;
    }

    getNext(): number {
        const nextLevelsetIndex = this.levelset.getRandomLevelIndex(this.played);
        this.played.push(nextLevelsetIndex);
        return nextLevelsetIndex;
    }
}
