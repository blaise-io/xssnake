'use strict';

/**
 * @constructor
 * @extends {xss.SelectStage}
 */
xss.MainStage = function() {
    this.menu = this._getMenu();

    if (xss.util.hash(xss.HASH_ROOM)) {
        this.autoJoinRoom();
    } else if (!xss.menuSnake) {
        xss.menuSnake = new xss.stage.MenuSnake();
    }

    xss.SelectStage.call(this);
};

xss.util.extend(xss.MainStage.prototype, xss.SelectStage.prototype);
xss.util.extend(xss.MainStage.prototype, /** @lends xss.MainStage.prototype */ {

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

    autoJoinRoom: function() {
        var dialog = new xss.Dialog('AUTO-JOIN ROOM', 'Connecting to server...');

        xss.player = new xss.room.ClientSocketPlayer(function() {
            window.setTimeout(function() {
                dialog.setBody('Getting room properties...');
                window.setTimeout(function() {
                    xss.player.emit(
                        xss.EVENT_ROOM_STATUS,
                        xss.util.hash(xss.HASH_ROOM)
                    );
                }, 500);
            }, 500);
        });

        xss.event.once(xss.EVENT_ROOM_STATUS, xss.NS_STAGES, function(data) {
            dialog.destruct();
            if (!data[0]) {
                xss.util.error(xss.room.ClientRoom.prototype.errorCodeToStr(data[1]));
            } else {
                this.data = {autoJoin: data};
                xss.flow.switchStage(xss.AutoJoinStage);
            }
        }.bind(this));
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
        menu.addOption(null, xss.SingleplayerStage, 'SINGLE PLAYER');
        menu.addOption(null, xss.ColorStage, 'COLOR SCHEME');
        menu.addOption(null, xss.CreditsStage, 'CREDITS');

        return menu;
    }

});

