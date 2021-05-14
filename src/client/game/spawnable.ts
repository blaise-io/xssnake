import { SPAWN_TYPE } from "../../shared/level/spawnables";
import { Shape } from "../../shared/shape";
import { UC } from "../const";
import { State } from "../state";
import { font } from "../ui/font";
import { flash } from "../ui/shapeClient";
import { translateGameX, translateGameY } from "../util/clientUtil";

const UC_MAP = {
    [SPAWN_TYPE.APPLE]: UC.APPLE,
    [SPAWN_TYPE.POWER]: UC.ELECTRIC,
};

const PIXEL_OFFSET_MAP = {
    [SPAWN_TYPE.APPLE]: [-1, -2],
    [SPAWN_TYPE.POWER]: [-1, -1],
};

export class ClientSpawnable {
    private readonly gameCoordinate: Coordinate;

    constructor(
        readonly shapeName: string,
        readonly type: SPAWN_TYPE,
        readonly coordinate: Coordinate,
    ) {
        this.gameCoordinate = [
            translateGameX(coordinate[0]) + PIXEL_OFFSET_MAP[type][0],
            translateGameY(coordinate[1]) + PIXEL_OFFSET_MAP[type][1],
        ];
        State.shapes[this.shapeName] = this.shape;
    }

    destruct(): void {
        delete State.shapes[this.shapeName];
    }

    get shape(): Shape {
        const shape = font(UC_MAP[this.type], ...this.gameCoordinate);
        flash(shape);
        return shape;
    }
}
