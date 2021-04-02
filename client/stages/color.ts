/**
 * @extends {SelectStage}
 * @implements {StageInterface}
 * @constructor
 */
ColorStage = function() {
    this.menu = this._getMenu();
    this.menu.select(storage(STORAGE_COLOR));
    SelectStage.call(this);
};

extend(ColorStage.prototype, SelectStage.prototype);
extend(ColorStage.prototype, /** @lends {ColorStage.prototype} */ {

    /**
     * @return {SelectMenu}
     * @private
     */
    _getMenu() {
        var menu = new SelectMenu('COLOR SCHEME');
        for (var i = 0, m = colorSchemes.length; i < m; i++) {
            var title = colorSchemes[i].title, desc = colorSchemes[i].desc;
            menu.addOption(null, null, title, desc, this._setColor.bind(this));
        }
        return menu;
    }

    /**
     * @param {number} index
     * @private
     */
    _setColor(index) {
        canvas.setColorScheme(colorSchemes[index]);
        storage(STORAGE_COLOR, index);
    }
});

