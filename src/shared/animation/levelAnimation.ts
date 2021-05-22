export class LevelAnimation {
    // private _animations: LevelAnimation[] = [];

    private _progressMs: number;

    constructor(seed: number, animation: LevelAnimation, progress: number) {
        // this._animations = animation ? animation(seed) : [];

        /**
         * @type {number}
         * @private
         */
        this._progressMs = progress || 0;
    }

    // /**
    //  * Returns an array of animations.
    //  * Every levelanim is an array of shapes, or null
    //  */
    // update(delta: number, gameStarted: boolean): ShapeCollection[] {
    //     const shapeCollections = [];
    //     this._progressMs += delta;
    //     for (let i = 0, m = this._animations.length; i < m; i++) {
    //         shapeCollections.push(this._animations[i].update(this._progressMs, gameStarted));
    //     }
    //     return shapeCollections;
    // }
}
