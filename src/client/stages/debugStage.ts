import { CANVAS } from "../../shared/const";
import { Shape } from "../../shared/shape";
import { fontPixels, fontWidth } from "../ui/font";
import { ScreenStage } from "./base/screenStage";

export class DebugStage extends ScreenStage {
    getShape(): Shape {
        return new Shape(fontPixels("DEBUG", CANVAS.WIDTH - 2 - fontWidth("DEBUG"), 2));
    }
}
