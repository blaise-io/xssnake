import { State } from "../../client/state/state";
import { Level } from "../level/level";
import { Levelset } from "../levelset/levelset";
import { Options } from "./options";
import { PlayerRegistry } from "./playerRegistry";

export class Round {
    levelsetIndex: number;
    levelIndex: number;
    private levelset: Levelset;
    level: Level;
    private index: number;
    private started: boolean;

    constructor(public players: PlayerRegistry, public options: Options) {
        this.levelsetIndex = null;
        this.levelIndex = null;
        this.levelset = null;
        this.level = null;
        this.index = 0;
        this.started = false;
    }

    serialize() {
        return [this.levelsetIndex, this.levelIndex];
    }

    deserialize(serialized) {
        this.levelsetIndex = serialized[0];
        this.levelIndex = serialized[1];
    }

    getLevel(levelsetIndex, levelIndex) {
        const levelset = State.levelsetRegistry.getLevelset(levelsetIndex);
        return levelset.getLevel(levelIndex);
    }
}
