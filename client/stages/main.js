'use strict';

/**
 * @constructor
 * @extends {xss.SelectStage}
 */
xss.MainStage = function() {
    var roomKey = xss.util.hash(xss.HASH_ROOM);
    this.menu = this._getMenu();

    if (roomKey) {
        new xss.stage.AutoJoinWizard(roomKey);
    } else if (!xss.menuSnake) {
        xss.menuSnake = new xss.stage.MenuSnake();
    }

    xss.SelectStage.call(this);
};

xss.extend(xss.MainStage.prototype, xss.SelectStage.prototype);
xss.extend(xss.MainStage.prototype, /** @lends {xss.MainStage.prototype} */ {

    construct: function() {
        this.data = {};
        xss.SelectStage.prototype.construct.apply(this, arguments);
    },

    /**
     * @return {Object}
     */
    getData: function() {
        return this.data;
    },

    /**
     * @return {xss.SelectMenu}
     * @private
     */
    _getMenu: function() {
        var menu, header, footer;

        header = function() {
            var name = xss.util.storage(xss.STORAGE_NAME);
            return name ?
                'YAY ' + name.toUpperCase() + ' IS BACK!' :
                'MULTIPLAYER SNAKE!';
        };

        footer = xss.COPY_MAIN_INSTRUCT;

        menu = new xss.SelectMenu(header, footer);
        menu.addOption(null, xss.stage.QuickGame, 'QUICK GAME');
        menu.addOption(null, xss.NameStage, 'MULTIPLAYER');
        menu.addOption(null, xss.stage.SinglePlayer, 'SINGLE PLAYER');
        menu.addOption(null, xss.ColorStage, 'COLOR SCHEME');
        menu.addOption(null, xss.CreditsStage, 'CREDITS');

        return menu;
    }

});

