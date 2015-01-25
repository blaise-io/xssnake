'use strict';

/**
 * @param {xss.Coordinate} part
 * @param {number} into
 * @constructor
 */
xss.game.Collision = function(part, into) {
    this.location = part;
    this.into = into;
    this.tick = 0;
};

xss.game.Collision.prototype = {

    serialize: function() {
        return this.location;
    }

};
