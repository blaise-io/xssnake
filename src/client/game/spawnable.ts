import { SPAWN_APPLE } from "../../shared/const";
import { Shape } from "../../shared/shape";
import { NS, UC } from "../const";
import { State } from "../state";
import { font } from "../ui/font";
import { flash } from "../ui/shapeClient";
import { translateGameX, translateGameY } from "../util/clientUtil";

export class Spawnable {
    private x: number;
    private y: number;
    private shapeName: string;

    constructor(public type: number, public index: number, public location: Coordinate) {
        this.x = translateGameX(location[0]);
        this.y = translateGameY(location[1]);

        this.shapeName = NS.SPAWN + index;
        State.shapes[this.shapeName] = this.shape;
    }

    destruct(): void {
        delete State.shapes[this.shapeName];
    }

    get shape(): Shape {
        let shape: Shape;
        const x = this.x;
        const y = this.y;

        if (this.type === SPAWN_APPLE) {
            shape = font(UC.APPLE, x - 1, y - 2);
        } else {
            shape = font(UC.ELECTRIC, x - 1, y - 1);
        }

        flash(shape);
        return shape;
    }
}
