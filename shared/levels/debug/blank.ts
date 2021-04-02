import { levels } from "../../data/levels";
import { Level } from "../../level/level";

export class BlankLevel extends Level {
    constructor(config) {
        super(config)
        config.level = levels.blank;
    }
}
