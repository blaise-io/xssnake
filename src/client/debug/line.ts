import { CANVAS } from "../../shared/const";
import { lineShape } from "../../shared/shapeGenerator";
import { State } from "../state";

export function debugLine(): void {
    window.setTimeout(() => {
        State.flow.destruct();
        State.shapes.topLeftToBottomRight = lineShape(0, 0, CANVAS.WIDTH - 1, CANVAS.HEIGHT - 1);
        State.shapes.bottomLeftToTopRight = lineShape(0, CANVAS.HEIGHT - 1, CANVAS.WIDTH - 1, 0);
    }, 200);
}
