'use strict';

/**
 * @param {Array.<xss.Shape>=} shapes
 * @constructor
 */
xss.ShapeCollection = function(shapes) {
    /** @type {Array.<xss.Shape>} */
    this.shapes = shapes || [];
};

xss.ShapeCollection.prototype = {

    /**
     * @param {xss.Shape} shape
     */
    add: function(shape) {
        this.shapes.push(shape);
    },

    /**
     * @param {number} index
     * @param {xss.Shape} shape
     */
    set: function(index, shape) {
        this.shapes[index] = shape;
    },

    /**
     * @param {function(xss.Shape, number)} callback
     */
    each: function(callback) {
        for (var i = 0, m = this.shapes.length; i < m; i++) {
            if (this.shapes[i]) {
                callback(this.shapes[i], i);
            }
        }
    }

};
