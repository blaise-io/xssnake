/**
 * Shifted Line -- for debugging
 *
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @param {number} sx
 * @param {number} sy
 * @implements {levelanim.Interface}
 * @constructor
 */
import { Shape } from "../shape";
import { ShapeCollection } from "../shapeCollection";
import { lineShape } from "../shapeGenerator";

export class ShiftedLine {
    private _lineShape: Shape;

    constructor(x0: number, y0: number, x1: number, y1: number, sx: number, sy: number) {
        this._lineShape = lineShape(x0, y0, x1, y1);
        this._lineShape.transform.translate = [sx, sy];
    }

    update(ms: number, gameStarted: boolean): ShapeCollection {
        return new ShapeCollection(this._lineShape);
    }
}
