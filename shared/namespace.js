'use strict';

xss.debug = {};
xss.data = {};
xss.bootstrap = {};
xss.room = {};
xss.game = {};
xss.level = {};
xss.levels = {};
xss.levelanim = {};
xss.levelanims = {};
xss.levelset = {};
xss.levelsets = {};
xss.netcode = {};
xss.stage = {};
xss.stages = {};
xss.util = {};
xss.ui = {};

/**
 * @param {Object} target
 * @param {...Object} varArgs
 */
xss.extend = function(target, varArgs) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var k in source) {
            if (source.hasOwnProperty(k)) {
                target[k] = source[k];
            }
        }
    }
};
