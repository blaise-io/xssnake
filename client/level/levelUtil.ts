import { levelsets } from "../../shared/data/levelsets";
import { LevelData } from "../../shared/level/data";
import { Level } from "../../shared/level/level";
import { Shape } from "../../shared/shape";
import { innerBorder, outerBorder } from "../ui/clientShapeGenerator";
import { setGameTransform } from "../ui/shapeClient";
import { getImageData } from "../util/clientUtil";

export async function levelUtil(): Promise<void> {
    levelsets.forEach((levelset) => {
        levelset.levels.forEach(async (level) => {
            level.data = new LevelData(await getImageData(level.image));
            level.image = null;
        });
    });
}

export function getLevelShapes(level: Level): Record<string, Shape> {
    return {
        level: setGameTransform(new Shape(level.data.walls)),
        innerborder: innerBorder(),
        ...outerBorder(),
    };
}
