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
    SelectStage.call(this);
}

XSS.util.extend(ColorStage.prototype, SelectStage.prototype);
XSS.util.extend(ColorStage.prototype, /** @lends ColorStage.prototype */ {

    /**
     * @returns {SelectMenu}
     * @private
     */
    _getMenu: function() {
        var menu, setColor, colorIndex = XSS.util.storage(CONST.STORAGE_COLOR);

        menu = new SelectMenu('COLOR SCHEME');
        menu._selected = parseInt(colorIndex, 10);

        setColor = function(index) {
            XSS.canvas.setColor(CONST.COLORS[index]);
            XSS.util.storage(CONST.STORAGE_COLOR, index);
        };

        for (var i = 0, m = CONST.COLORS.length; i < m; i++) {
            var title = CONST.COLORS[i].title, desc = CONST.COLORS[i].desc;
            menu.addOption(true, null, title, desc, setColor);
        }

        return menu;
    }

});
