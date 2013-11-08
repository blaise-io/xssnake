'use strict';

// TODO: Move to separate file
xss.animations = {};


/**
 * @interface
 * @constructor
 * @todo: Move to separate file
 */
xss.animations.Interface = function() {};
xss.animations.Interface.prototype = {
    /**
     * @type string
     */
    seed: '',
    /**
     * @param ms
     * @return {Array.<Shape>}
     */
    update: function(ms) {}
};


/**
 * @implements {xss.animations.Interface}
 * @constructor
 */
xss.animations.RotatingLine = function() {
    var h, w, x1, y1;

    w = 1;
    h = 20;
    x1 = Math.round(xss.WIDTH/2 - w/2);
    y1 = Math.round(xss.HEIGHT/2 - h/2);

    this.seed = '';
    this.shape = xss.shapegen.lineShape(x1, y1, x1 + w, y1 + h);
};

xss.animations.RotatingLine.prototype = {
    update: function(ms) {
        // @todo Create function: rotatedShape(w,h,x,y,rotation,rotateX,rotateY)
        return [this.shape];
    }
};
