'use strict';

/**
 * @extends {xss.levelset.Levelset}
 * @constructor
 */
xss.levelset.Basic = function() {
    xss.levelset.Levelset.apply(this, arguments);
    this.title = xss.COPY_LEVELSET_BASIC;
};

xss.extend(xss.levelset.Basic.prototype, xss.levelset.Levelset.prototype);
xss.extend(xss.levelset.Basic.prototype, /** @lends {xss.levelset.Basic.prototype} */ {

});
