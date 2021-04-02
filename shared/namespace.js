'use strict';


/** @deprecated */xss.debug = {};
/** @deprecated */xss.data = {};
/** @deprecated */xss.bootstrap = {};
/** @deprecated */xss.room = {};
/** @deprecated */xss.game = {};
/** @deprecated */xss.level = {};
/** @deprecated */xss.levels = {};
/** @deprecated */xss.levelanim = {};
/** @deprecated */xss.levelanims = {};
/** @deprecated */xss.levelset = {};
/** @deprecated */xss.levelsets = {};
/** @deprecated */xss.netcode = {};
/** @deprecated */xss.stage = {};
/** @deprecated */xss.stages = {};
/** @deprecated */xss.util = {};
/** @deprecated */xss.ui = {};

/**
 * @deprecated
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
