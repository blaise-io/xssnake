import { Levelset } from "../../shared/levelset/levelset";
import { State } from "../state/state";

export class LevelPlayset {
    private played: number[];
    private levelset: Levelset;
    constructor(public levelsetIndex: number) {
        this.levelset = State.levelsetRegistry.getLevelset(levelsetIndex);
        this.played = [];
    }

    destruct() {
        this.levelset = null;
        this.played = null;
    }

    getNext() {
        let nextLevelsetIndex = this.levelset.getRandomLevelIndex(this.played);
        this.played.push(nextLevelsetIndex);
        return nextLevelsetIndex;
    }
}
