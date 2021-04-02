/**
 * @param {number} x
 * @param {number} y
 * @param {number} len
 * @param {number=} speed
 * @implements {levelanim.Interface}
 * @constructor
 */
export class RotatingLine {
    constructor(RotatingLine) {
    this.x = x;
    this.y = y;
    this.len = len;
    this.speed = speed || 0.5;
};



    /**
     * @param {number} ms
     * @param {boolean} gameStarted
     * @return {ShapeCollection|null}
     */
    update(ms, gameStarted) {
        var radian = ms / Math.pow(1 - this.speed, 1.5) / 2500;
        radian = Math.round(radian * 20) / 20; // No need for 60 fps.
        if (radian !== this.radian) {
            this.radian = radian;
            return this._update(radian);
        }
        return null;
    },

    /**
     * @param {number} radian
     * @return {ShapeCollection}
     * @private
     */
    _update(radian) {
        var shape = new Shape(
            radianLine(this.x, this.y, radian, this.len)
        );
        return new ShapeCollection([shape]);
    }
};
