/**
 * @param {number} seed
 * @param {Function=} animation
 * @param {number=} progress Animation progress (in ms)
 * @constructor
 */
import { ShapeCollection } from "../shapeCollection";

export class LevelAnimation {
    private _animations: any;
    private _progressMs: number;

    constructor(seed: number, animation: any, progress: number) {
        /**
         * List of animations.
         * Each levelanim has one or more shapes that update every N ms.
         *
         * @type {Array.<levelanim.Interface>}
         * @private
         */
        this._animations = animation ? animation(seed) : [];

        /**
         * @type {number}
         * @private
         */
        this._progressMs = progress || 0;
    }

    /**
     * Returns an array of animations.
     * Every levelanim is an array of shapes, or null
     */
    update(delta: number, gameStarted: boolean): ShapeCollection[] {
        const shapeCollections = [];
        this._progressMs += delta;
        for (let i = 0, m = this._animations.length; i < m; i++) {
            shapeCollections.push(
                this._animations[i].update(this._progressMs, gameStarted)
            );
        }
        return shapeCollections;
    }

}
