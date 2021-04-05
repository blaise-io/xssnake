import { SPAWN_APPLE, SPAWN_POWERUP } from "../../shared/const";
import { Shape } from "../../shared/shape";
import { NS_SPAWN, UC_APPLE, UC_ELECTRIC } from "../const";
import { State } from "../state/state";
import { font } from "../ui/font";
import { flash } from "../ui/shapeClient";
import { translateGameX, translateGameY } from "../util/clientUtil";

export class Spawnable {
    private x: number;
    private y: number;
    private _shapeName: string;

    constructor(public type: number, public index: number, public location: Coordinate) {
        this.x = translateGameX(location[0]);
        this.y = translateGameY(location[1]);

        this._shapeName = NS_SPAWN + index;
        State.shapes[this._shapeName] = this._getShape();
    }

    destruct() {
        State.shapes[this._shapeName] = null;
    }

    _getShape(): Shape {
        let shape;
        const x = this.x;
        const y = this.y;

        switch (this.type) {
            case SPAWN_APPLE:
                shape = font(UC_APPLE, x - 1, y - 2);
                break;
            case SPAWN_POWERUP:
                shape = font(UC_ELECTRIC, x - 1, y - 1);
                break;
        }

        flash(shape);
        return shape;
    }
}
