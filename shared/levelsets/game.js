'use strict';

/**
 * @extends {xss.levelset.Levelset}
 * @constructor
 */
xss.levelset.Game = function() {
    xss.levelset.Levelset.apply(this, arguments);
    this.title = xss.COPY_LEVELSET_GAME;
};

xss.util.extend(xss.levelset.Game.prototype, xss.levelset.Levelset.prototype);
xss.util.extend(xss.levelset.Game.prototype, {

});
