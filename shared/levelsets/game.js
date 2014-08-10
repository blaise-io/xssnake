'use strict';

/**
 * @extends {xss.levelset.Base}
 * @constructor
 */
xss.levelset.Game = function() {
    xss.levelset.Base.apply(this, arguments);
    this.title = xss.COPY_LEVELSET_GAME;
};

xss.util.extend(xss.levelset.Game.prototype, xss.levelset.Base.prototype);
xss.util.extend(xss.levelset.Game.prototype, {

});
