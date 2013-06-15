/*jshint globalstrict:true, es5:true, sub:true, evil:true*/
/*globals XSS, CONST, SelectStage, SelectMenu, Dialog, Room, Socket, ClientSnake, NameStage, StartGameStage, ColorStage, CreditsStage, AutoJoinStage */
'use strict';

/**
 * @constructor
 * @implements {StageInterface}
 * @extends {SelectStage}
 */
function MainStage() {
    this.menu = this._getMenu();

    if (XSS.util.hash(CONST.HASH_ROOM)) {
        this.autoJoinRoom();
    } else if (!XSS.menuSnake) {
        this._launchMenuSnake();
    }

    SelectStage.call(this);
}

XSS.util.extend(MainStage.prototype, SelectStage.prototype);
XSS.util.extend(MainStage.prototype, /** @lends MainStage.prototype */ {

    construct: function() {
        this.data = {};
        SelectStage.prototype.construct.apply(this, arguments);
    },

    /**
     * @returns {Object}
     */
    getData: function() {
        return this.data;
    },

    autoJoinRoom: function() {
        var dialog = new Dialog('AUTO-JOIN ROOM', 'Connecting to server...');

        XSS.socket = new Socket(function() {
            window.setTimeout(function() {
                dialog.setBody('Getting room properties...');
                window.setTimeout(function() {
                    XSS.socket.emit(
                        CONST.EVENT_ROOM_STATUS,
                        XSS.util.hash(CONST.HASH_ROOM)
                    );
                }, 500);
            }, 500);
        });

        XSS.event.once(CONST.EVENT_ROOM_STATUS, CONST.NS_STAGES, function(data) {
            dialog.destruct();
            if (!data[0]) {
                XSS.util.error(Room.prototype.errorCodeToStr(data[1]));
            } else {
                this.data = {autoJoin: data};
                XSS.flow.switchStage(AutoJoinStage);
            }
        }.bind(this));
    },

    /**
     * @returns {SelectMenu}
     * @private
     */
    _getMenu: function() {
        var menu, header, footer;

        header = function() {
            var name = XSS.util.storage(CONST.STORAGE_NAME);
            return name ?
                'WLCM BCK ' + name.toUpperCase() + '!' :
                'WELCOME STRANGER!!';
        };

        footer = '' +
            'Press M to mute/unmute sounds.\n' +
            'Use arrow keys, Esc and ' + CONST.UC_ENTER_KEY + ' to navigate.';

        menu = new SelectMenu(header, footer);
        menu.addOption(null, NameStage, 'MULTIPLAYER');
        menu.addOption(null, StartGameStage, 'SINGLE PLAYER');
        menu.addOption(null, ColorStage, 'COLOR SCHEME');
        menu.addOption(null, CreditsStage, 'CREDITS');

        return menu;
    },

    /**
     * @private
     */
    _launchMenuSnake: function() {
        var snake;

        if (XSS.room) {
            return;
        }

        window.setTimeout(this._updateMenuSnake.bind(this), 1000);

        snake = new ClientSnake(-1, true, '', [1, 1], 2);
        snake.local = true;
        snake.addToShapes();
        snake.addControls();
        snake.showDirection();
        snake.removeNameAndDirection();

        XSS.menuSnake = snake;
    },

    /**
     * @private
     */
    _updateMenuSnake: function() {
        var nextpos, snake = XSS.menuSnake;
        nextpos = snake.getNextPosition();
        if (XSS.room) {
            snake.destruct();
        } else if (this._isMenuSnakeCrash(snake, nextpos)) {
            snake.crash();
            window.setTimeout(snake.destruct.bind(snake), 1000);
            window.setTimeout(this._launchMenuSnake.bind(this), 1000 * 15);
        } else {
            snake.move(nextpos);
            snake.updateShape();
            window.setTimeout(this._updateMenuSnake.bind(this), 100);
        }
    },

    /**
     * @param {ClientSnake} snake
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
                    if (snakeShape.pixels.hasMultiple(XSS.shapes, x, y)) {
                        crash = true;
                    }
                }
            });
        }
        return crash;
    }

});
