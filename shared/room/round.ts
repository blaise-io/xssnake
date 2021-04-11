import { levelsets } from "../data/levelsets";
import { Level } from "../level/level";
import { Levelset } from "../levelset/levelset";
import { RoomOptions } from "./roomOptions";
import { PlayerRegistry } from "./playerRegistry";

export class Round {
    levelsetIndex: number;
    levelIndex: number;
    levelset: Levelset;
    level: Level;
    private index: number;
    started: boolean;

    constructor(public players: PlayerRegistry, public options: RoomOptions) {
        this.levelsetIndex = null;
        this.levelIndex = null;
        this.levelset = null;
        this.level = null;
        this.index = 0;
        this.started = false;
    }

    serialize(): number[] {
        return [this.levelsetIndex, this.levelIndex];
    }

    deserialize(serialized: number[]): void {
        this.levelsetIndex = serialized[0];
        this.levelIndex = serialized[1];
    }

    getLevel(levelsetIndex: number, levelIndex: number): Level {
        return levelsets[levelsetIndex].getLevel(levelIndex);
    }
}
