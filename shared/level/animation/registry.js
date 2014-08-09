'use strict';

/**
 * @constructor
 */
xss.level.animation.Registry = function() {
    this.animations = [];
};

xss.level.animation.Registry.prototype = {
    register: function(animation) {
        this.animations.push(animation);
    }
};
