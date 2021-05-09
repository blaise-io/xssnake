import { Shape } from "../shape";
import { ShapeCollection } from "../shapeCollection";
import { radianLine } from "../shapeGenerator";

export class RotatingLine {
    private radian: number;

    constructor(
        public x: number,
        public y: number,
        public len: number,
        public speed: number = 0.5,
    ) {}

    update(ms: number): ShapeCollection | null {
        let radian = ms / Math.pow(1 - this.speed, 1.5) / 2500;
        radian = Math.round(radian * 20) / 20; // No need for 60 fps.
        if (radian !== this.radian) {
            this.radian = radian;
            return this._update(radian);
        }
        return null;
    }

    private _update(radian: number): ShapeCollection {
        return [new Shape(radianLine(this.x, this.y, radian, this.len))];
    }
}
