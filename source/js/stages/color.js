/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, CONST, SelectMenu, SelectStage*/
'use strict';

/**
 * @extends {SelectStage}
 * @implements {StageInterface}
 * @constructor
 */
function ColorStage() {
    this.menu = this._getMenu();
    this.menu.select(XSS.util.storage(CONST.STORAGE_COLOR));
    SelectStage.call(this);
}

XSS.util.extend(ColorStage.prototype, SelectStage.prototype);
XSS.util.extend(ColorStage.prototype, /** @lends ColorStage.prototype */ {

    /**
     * @returns {SelectMenu}
     * @private
     */
    _getMenu: function() {
        var menu = new SelectMenu('COLOR SCHEME');
        for (var i = 0, m = CONST.COLORS.length; i < m; i++) {
            var title = CONST.COLORS[i].title, desc = CONST.COLORS[i].desc;
            menu.addOption(null, null, title, desc, this._setColor.bind(this));
        }
        return menu;
    },

    /**
     * @param {number} index
     * @private
     */
    _setColor: function(index) {
        XSS.canvas.setColor(CONST.COLORS[index]);
        XSS.util.storage(CONST.STORAGE_COLOR, index);
    }

});
