import { Shape } from "../../shared/shape";
import { State } from "../state";
import { fontPixels } from "../ui/font";
import { flash, lifetime } from "../ui/shapeClient";
import { zoom } from "../ui/transformClient";

export function debugLifetimeEffect(): void {
    const shape1 = new Shape(zoom(2, fontPixels("2,5"), 10, 50));
    lifetime(shape1, 2000, 5000);

    const shape2 = new Shape(zoom(2, fontPixels("2,X"), 10, 70));
    lifetime(shape2, 2000);

    const shape3 = new Shape(zoom(2, fontPixels("0,5"), 10, 90));
    lifetime(shape3, 0, 5000);

    const shape4 = new Shape(zoom(2, fontPixels("2,X FLASH"), 10, 110));
    lifetime(shape4, 2000);
    flash(shape4);

    const shape5 = new Shape(zoom(2, fontPixels("2,5 FLASH RM"), 10, 130));
    lifetime(shape5, 0, 5000);
    flash(shape5);

    setTimeout(() => {
        delete State.shapes.shape5;
    }, 3000);

    State.shapes.shape1 = shape1;
    State.shapes.shape2 = shape2;
    State.shapes.shape3 = shape3;
    State.shapes.shape4 = shape4;
    State.shapes.shape5 = shape5;
}
