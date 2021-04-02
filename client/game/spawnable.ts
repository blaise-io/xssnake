/**
 * @param {number} type
 * @param {number} index
 * @param {Coordinate} location
 * @constructor
 */
export class Spawnable {
    constructor(type, index, location) {
    this.type = type;
    this.x = translateGameX(location[0]);
    this.y = translateGameY(location[1]);

    this._shapeName = NS_SPAWN + index;
    State.shapes[this._shapeName] = this._getShape();
};



    destruct() {
        State.shapes[this._shapeName] = null;
    }

    /**
     * @return {Shape}
     * @private
     */
    _getShape() {
        var shape, x = this.x, y = this.y;

        switch (this.type) {
            case SPAWN_APPLE:
                shape = font(UC_APPLE, x - 1,  y - 2);
                break;
            case SPAWN_POWERUP:
                shape = font(UC_ELECTRIC, x - 1,  y - 1);
                break;
        }

        shape.flash();
        return shape;
    }

};
