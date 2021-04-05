/**
 * @interface
 * @param {number=} seed
 */
export class Interface {
    constructor(Interface) {}

    /**
     * Return one or more {PixelCollection}'s.
     * Return null if animation was not updated.
     * @param {number} ms
     * @param {boolean} preGame
     * @return {ShapeCollection}
     */
    update(ms, preGame): void {
        return null;
    }
}
