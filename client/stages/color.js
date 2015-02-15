'use strict';

/**
 * @extends {xss.SelectStage}
 * @implements {xss.StageInterface}
 * @constructor
 */
xss.ColorStage = function() {
    this.menu = this._getMenu();
    this.menu.select(xss.util.storage(xss.STORAGE_COLOR));
    xss.SelectStage.call(this);
};

xss.extend(xss.ColorStage.prototype, xss.SelectStage.prototype);
xss.extend(xss.ColorStage.prototype, /** @lends {xss.ColorStage.prototype} */ {

    /**
     * @return {xss.SelectMenu}
     * @private
     */
    _getMenu: function() {
        var menu = new xss.SelectMenu('COLOR SCHEME');
        for (var i = 0, m = xss.colorSchemes.length; i < m; i++) {
            var title = xss.colorSchemes[i].title, desc = xss.colorSchemes[i].desc;
            menu.addOption(null, null, title, desc, this._setColor.bind(this));
        }
        return menu;
    },

    /**
     * @param {number} index
     * @private
     */
    _setColor: function(index) {
        xss.canvas.setColorScheme(xss.colorSchemes[index]);
        xss.util.storage(xss.STORAGE_COLOR, index);
    }
});

