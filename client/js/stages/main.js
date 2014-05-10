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
        this._launchMenuSnake();
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
     * @returns {Object}
     */
    getData: function() {
        return this.data;
    },

    autoJoinRoom: function() {
        var dialog = new xss.Dialog('AUTO-JOIN ROOM', 'Connecting to server...');

        xss.socket = new xss.Socket(function() {
            window.setTimeout(function() {
                dialog.setBody('Getting room properties...');
                window.setTimeout(function() {
                    xss.socket.emit(
                        xss.EVENT_ROOM_STATUS,
                        xss.util.hash(xss.HASH_ROOM)
                    );
                }, 500);
            }, 500);
        });

        xss.event.once(xss.EVENT_ROOM_STATUS, xss.NS_STAGES, function(data) {
            dialog.destruct();
            if (!data[0]) {
                xss.util.error(xss.Room.prototype.errorCodeToStr(data[1]));
            } else {
                this.data = {autoJoin: data};
                xss.flow.switchStage(xss.AutoJoinStage);
            }
        }.bind(this));
    },

    /**
     * @returns {xss.SelectMenu}
     * @private
     */
    _getMenu: function() {
        var menu, header, footer;

        header = function() {
            var name = xss.util.storage(xss.STORAGE_NAME);
            return name ?
                'YAY ' + name.toUpperCase() + ' IS BACK!' :
                'PLAY SNAKE ONLINE!!';
        };

        footer = '' +
            'Press M to mute/unmute sounds.\n' +
            'Use arrow keys, Esc and ' + xss.UC_ENTER_KEY + ' to navigate.';

        menu = new xss.SelectMenu(header, footer);
        menu.addOption(null, xss.NameStage, 'MULTIPLAYER');
        menu.addOption(null, xss.SingleplayerStage, 'SINGLE PLAYER');
        menu.addOption(null, xss.ColorStage, 'COLOR SCHEME');
        menu.addOption(null, xss.CreditsStage, 'CREDITS');

        return menu;
    },

    /**
     * @private
     */
    _launchMenuSnake: function() {
        var snake;

        if (xss.room) {
            return;
        }

        window.setTimeout(this._updateMenuSnake.bind(this), 1000);

        snake = new xss.ClientSnake(-1, true, '', [1, 1], 2);
        snake.local = true;
        snake.addToShapes();
        snake.addControls();
        snake.showDirection();
        snake.removeNameAndDirection();

        xss.menuSnake = snake;
    },

    /**
     * @private
     */
    _updateMenuSnake: function() {
        var nextpos, snake = xss.menuSnake;
        nextpos = snake.getNextPosition();
        if (xss.room) {
            snake.destruct();
        } else if (this._isMenuSnakeCrash(snake, nextpos)) {
            snake.crash();
            window.setTimeout(snake.destruct.bind(snake), 1000);
            // Respawn menu snake
            // window.setTimeout(this._launchMenuSnake.bind(this), 1000 * 15);
        } else {
            snake.move(nextpos);
            snake.updateShape();
            window.setTimeout(this._updateMenuSnake.bind(this), 100);
        }
    },

    /**
     * @param {xss.ClientSnake} snake
     * @param {Array.<number>} nextpos
     * @returns {boolean}
     * @private
     */
    _isMenuSnakeCrash: function(snake, nextpos) {
        var snakeShape = snake.getShape(), crash = false;
        if (nextpos[0] < 0 || nextpos[1] < 0) {
            crash = true;
        } else if (snakeShape) {
            snakeShape.pixels.each(function(x, y) {
                if (x % 2 || y % 2) {
                    if (snakeShape.pixels.hasMultiple(xss.shapes, x, y)) {
                        crash = true;
                    }
                }
            });
        }
        return crash;
    }
});

