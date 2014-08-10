'use strict';

/**
 * @extends {xss.levelset.Base}
 * @constructor
 */
xss.levelset.Basic = function() {
    xss.levelset.Base.apply(this, arguments);
    this.title = xss.COPY_LEVELSET_BASIC;
};

xss.util.extend(xss.levelset.Basic.prototype, xss.levelset.Base.prototype);
xss.util.extend(xss.levelset.Basic.prototype, {

});
