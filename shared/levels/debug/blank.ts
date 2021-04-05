import { levels } from "../../data/levels";
import { Level } from "../../level/level";
import { Config } from "../../levelset/config";

export class BlankLevel extends Level {
    constructor(config: Config) {
        super(config);
        config.level = levels.blank;
    }
}
