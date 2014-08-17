'use strict';

/**
 * @constructor
 */
xss.levelanim.Registry = function() {
    /** @type {Array.<xss.levelanim.Interface>} */
    this.animations = [];
    /** @type {Array.<xss.ShapeCollection>} */
    this.walls = [];
    this.started = false;
    this.progress = 0;
};

xss.levelanim.Registry.prototype = {

    /**
     * @param {xss.levelanim.Interface} animation
     */
    register: function(animation) {
        this.animations.push(animation);
    },

    /**
     * @param {number} delta
     * @param {boolean} started
     */
    update: function(delta, started) {
        this.progress += delta;
        this.started = started;
        this.walls = this.updateAnimations();
        this.updateShapes();
    },

    updateAnimations: function() {
        var walls = [];
        for (var i = 0, m = this.animations.length; i < m; i++) {
            var shapeCollection = this.updateAnimation(this.animations[i]);
            if (shapeCollection) {
                walls.push(shapeCollection);
            }
        }
        return walls;
    },

    /**
     * @param {xss.levelanim.Interface} animation
     * @return {xss.ShapeCollection}
     */
    updateAnimation: function(animation) {
        return animation.update(this.progress, this.started);
    },

    updateShapes: function() {
        for (var i = 0, m = this.walls.length; i < m; i++) {
            if (this.walls[i]) {
                this._updateShapes(i, this.walls[i]);
            }
        }
    },

    /**
     * @param {number} animIndex
     * @param {xss.ShapeCollection} shapeCollection
     */
    _updateShapes: function(animIndex, shapeCollection) {
        var shapes = shapeCollection.shapes;
        for (var i = 0, m = shapes.length; i < m; i++) {
            this._updateShape([xss.NS_ANIM, animIndex, i].join('_'), shapes[i]);
        }
    },

    /**
     * @param {string} key
     * @param {xss.Shape} shape
     * @private
     */
    _updateShape: function(key, shape) {
        if (shape) {
            if (!shape.headers.transformed) {
                shape.setGameTransform();
                shape.headers.transformed = true;
            }
            xss.shapes[key] = shape;
        } else {
            xss.shapes[key] = null;
        }
    }

};
