import { levelSets } from "../levelSet/levelSets";
import { Level } from "../level/level";
import { Player } from "./player";
import { RoomOptions } from "./roomOptions";
import { PlayerRegistry } from "./playerRegistry";

export class Round {
    levelSetIndex: number;
    levelIndex: number;
    level: Level;
    private index: number;
    started: boolean;

    constructor(public players: PlayerRegistry<Player>, public options: RoomOptions) {
        this.levelSetIndex = undefined;
        this.levelIndex = undefined;
        this.level = undefined;
        this.index = 0;
        this.started = false;
    }

    serialize(): number[] {
        return [this.levelSetIndex, this.levelIndex];
    }

    deserialize(serialized: number[]): void {
        this.levelSetIndex = serialized[0];
        this.levelIndex = serialized[1];
    }

    getLevel(levelSetIndex: number, levelIndex: number): typeof Level {
        return levelSets[levelSetIndex][levelIndex];
    }
}
