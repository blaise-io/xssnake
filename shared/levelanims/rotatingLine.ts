/**
 * @param {number} x
 * @param {number} y
 * @param {number} len
 * @param {number=} speed
 * @implements {levelanim.Interface}
 * @constructor
 */
import { Shape } from "../shape";
import { ShapeCollection } from "../shapeCollection";
import { radianLine } from "../shapeGenerator";

export class RotatingLine {
    private radian: number;

    constructor(public x: number, public y: number, public len: number, public speed: number = 0.5) {
    }

    /**
     * @param {number} ms
     * @param {boolean} gameStarted
     * @return {ShapeCollection|null}
     */
    update(ms, gameStarted) {
        let radian = ms / Math.pow(1 - this.speed, 1.5) / 2500;
        radian = Math.round(radian * 20) / 20; // No need for 60 fps.
        if (radian !== this.radian) {
            this.radian = radian;
            return this._update(radian);
        }
        return null;
    }

    /**
     * @param {number} radian
     * @return {ShapeCollection}
     * @private
     */
    _update(radian) {
        const shape = new Shape(
            radianLine(this.x, this.y, radian, this.len)
        );
        return new ShapeCollection(shape);
    }
}
