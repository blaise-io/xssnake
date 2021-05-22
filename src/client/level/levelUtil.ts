import { Level } from "../../shared/level/level";
import { Shape } from "../../shared/shape";
import { innerBorder, outerBorder } from "../ui/clientShapeGenerator";
import { setGameTransform } from "../ui/shapeClient";

export function getLevelShapes(level: Level): Record<string, Shape> {
    return {
        level: setGameTransform(new Shape(level.data.walls)),
        innerborder: innerBorder(),
        ...outerBorder(),
    };
}
