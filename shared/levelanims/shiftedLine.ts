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
export class ShiftedLine {
    constructor(ShiftedLine) {
    this._lineShape = lineShape(x0, y0, x1, y1);
    this._lineShape.transform.translate = [sx, sy];
};



    /**
     * @param {number} ms
     * @param {boolean} gameStarted
     * @return {ShapeCollection}
     */
    update(ms, gameStarted) {
        return new ShapeCollection([this._lineShape]);
    }
};
