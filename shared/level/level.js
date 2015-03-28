'use strict';

/**
 * @param {xss.levelset.Config} config
 * @constructor
 */
xss.level.Level = function(config) {
    this.config = config;
    this.animations = new xss.levelanim.Registry();
    this.gravity = new xss.level.Gravity(this.config.gravity);

    /** @type {xss.level.Data} */
    this.data = config.level.cache || null;
};

xss.level.Level.prototype = {

    registerAnimations: xss.util.noop,

    /**
     * Client-Only!
     * TODO: Create and add to xss.level.ClientLevel instead.
     */
    destruct: function() {
        if (xss.IS_CLIENT) {
            xss.shapes.level = null;
            xss.shapes.innerborder = null;
            xss.shapegen.outerBorder(function(k) {
                xss.shapes[k] = null;
            });
        }
    },

    /**
     * Client-Only!
     * TODO: Create and add to xss.level.ClientLevel instead.
     */
    paint: function() {
        if (xss.IS_CLIENT) {
            xss.shapes.level = new xss.Shape(this.data.walls);
            xss.shapes.level.setGameTransform();
            xss.shapes.innerborder = xss.shapegen.innerBorder();
            xss.shapegen.outerBorder(function(k, border) {
                xss.shapes[k] = border;
            });
        }
    },

    /**
     * @param {Function} continueFn
     */
    preload: function(continueFn) {
        var level = this.config.level;
        if (level.cache) {
            continueFn();
        } else {
            new xss.level.ImageDecoder(level.imagedata).then(function(data) {
                level.cache = new xss.level.Data(data, this.animations);
                level.imagedata = null;
                this.data = level.cache;
                this.registerAnimations();
                continueFn();
            }.bind(this));
        }
    }
};
