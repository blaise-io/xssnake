import { Level } from "../level/level";
import { levelSets } from "../levelSet/levelSets";
import { Player } from "./player";
import { PlayerRegistry } from "./playerRegistry";
import { RoomOptions } from "./roomOptions";

export class Round {
    level?: Level;

    constructor(
        readonly players: PlayerRegistry<Player>,
        readonly options: RoomOptions,
        public levelIndex: number,
    ) {}

    get LevelClass(): typeof Level {
        return levelSets[this.options.levelSetIndex as number][this.levelIndex as number];
    }
}
