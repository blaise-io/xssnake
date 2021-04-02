/**
 * @param {Array.<Shape>=} shapes
 * @constructor
 */
ShapeCollection = function(shapes) {
    /** @type {Array.<Shape>} */
    this.shapes = shapes || [];
};



    /**
     * @param {Shape} shape
     */
    add(shape) {
        this.shapes.push(shape);
    },

    /**
     * @param {number} index
     * @param {Shape} shape
     */
    set(index, shape) {
        this.shapes[index] = shape;
    },

    /**
     * @param {function(Shape, number)} callback
     */
    each(callback) {
        for (var i = 0, m = this.shapes.length; i < m; i++) {
            if (this.shapes[i]) {
                callback(this.shapes[i], i);
            }
        }
    }

};
