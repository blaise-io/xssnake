import { Level } from "../level/level";
import { randomArrIndex } from "../util";

interface LevelConstructor {
    new (): Level;
}

export class LevelSet extends Array<LevelConstructor> {
    constructor(public title: string) {
        super(); // new Array();
    }
}

export function getRandomLevelIndex(levelSet: LevelSet, levelsPlayed: number[]): number {
    const notPlayed = levelSet.slice();

    if (notPlayed.length <= 1) {
        return 0;
    }

    // All images were played.
    // Play any level except the one just played.
    // TODO: this has a bug where it will play 1,2,3,4 any of 1,2,3, then 4.
    if (levelSet.length === levelsPlayed.length) {
        levelsPlayed = levelsPlayed.splice(0, levelsPlayed.length - 1);
    }

    for (let i = 0, m = levelsPlayed.length; i < m; i++) {
        notPlayed.splice(levelsPlayed[i], 1);
    }

    return randomArrIndex(notPlayed);
}
