import { Level } from "../level/level";
import { levelSets } from "../levelSet/levelSets";
import { Player } from "./player";
import { PlayerRegistry } from "./playerRegistry";
import { RoomOptions } from "./roomOptions";

export class Round {
    levelSetIndex?: number;
    levelIndex?: number;
    level?: Level;
    private index: number;
    started: boolean;

    constructor(public players: PlayerRegistry<Player>, public options: RoomOptions) {
        this.index = 0;
        this.started = false;
    }

    get LevelClass(): typeof Level {
        return levelSets[this.levelSetIndex as number][this.levelIndex as number];
    }
}
