/**
 * Static Line -- for debugging
 *
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @implements {levelanim.Interface}
 * @constructor
 */
export class StaticLine {
    constructor(StaticLine) {
    this._lineShape = lineShape(x0, y0, x1, y1);
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
