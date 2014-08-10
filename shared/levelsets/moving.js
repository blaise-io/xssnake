'use strict';

/**
 * @extends {xss.levelset.Base}
 * @constructor
 */
xss.levelset.Moving = function() {
    xss.levelset.Base.apply(this, arguments);
    this.title = xss.COPY_LEVELSET_MOVING;
};

xss.util.extend(xss.levelset.Moving.prototype, xss.levelset.Base.prototype);
xss.util.extend(xss.levelset.Moving.prototype, {

});
