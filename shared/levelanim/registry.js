'use strict';

/**
 * @constructor
 */
xss.levelanim.Registry = function() {
    this.animations = [];
};

xss.levelanim.Registry.prototype = {
    register: function(animation) {
        this.animations.push(animation);
    },

    /**
     * @return {xss.ShapeCollection}
     */
    getMovingWalls: function() {
        // @todo
        return null;
    }
};
