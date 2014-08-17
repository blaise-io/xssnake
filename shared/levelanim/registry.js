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
     * @param {number} index
     * @param {xss.ShapeCollection} shapeCollection
     */
    _updateShapes: function(index, shapeCollection) {
        var shapes = shapeCollection.shapes;
        for (var i = 0, m = shapes.length; i < m; i++) {
            var key = xss.NS_ANIM + index + '_' + i;
            if (shapes[i]) {
                if (!shapes[i].headers.transformed) {
                    shapes[i].setGameTransform();
                    shapes[i].headers.transformed = true;
                }
                xss.shapes[key] = shapes[i];
            } else {
                xss.shapes[key] = null;
            }
        }
    }

};
