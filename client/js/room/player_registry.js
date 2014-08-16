'use strict';

/**
 * @param {Array.<string>} names
 * @param {number=} local
 * @constructor
 */
xss.room.PlayerRegistry = function(names, local) {
    this.names = names;
    this.local = local;
};

xss.room.PlayerRegistry.prototype = {};
