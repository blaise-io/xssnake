/*jshint globalstrict:true, sub:true*/
/*globals XSS,PixelEntity*/

// TODO: Make Snake a separate object

'use strict';

/**
 * Game
 * @constructor
 */
function Game() {
}

Game.prototype = {

    init: function() {

        this.snakeHead = [10, 10];
        this.snakeDirection = 2;
        this.snakeDirectionRequests = [];
        this.snakeSize = 15;
        this.snakePixels = [this.snakeHead]; // snake head is last index
        this.snakeSpeed = 100; // ms until next occupy

        this.lastStep = 0;

        XSS.ents.border = XSS.drawables.getOuterBorder();
        XSS.ents.snake = new PixelEntity().dynamic(true);

//        XSS.socket.init(function(socket) {
//            socket.emit('/xss/name', 'Blaise');
//            socket.emit('/xss/game', {'mode': 'XSS', 'room': 'public'});
//            this.addEventHandlers();
//        }.bind(this));


        this._addEventListeners();
    },

    directionShiftMap: [[-1, 0], [0, -1], [1, 0], [0, 1]],

    /** @private */
    _addEventListeners: function() {
        XSS.on.keydown(this._handleKeys.bind(this));
        XSS.utils.subscribe('/canvas/update', 'movesnake', this._moveSnake.bind(this));
    },

    /** @private */
    _handleKeys: function(e) {
        switch (e.which) {
            case XSS.KEY_LEFT:
                this._changeDirection(XSS.DIRECTION_LEFT);
                break;
            case XSS.KEY_UP:
                this._changeDirection(XSS.DIRECTION_UP);
                break;
            case XSS.KEY_RIGHT:
                this._changeDirection(XSS.DIRECTION_RIGHT);
                break;
            case XSS.KEY_DOWN:
                this._changeDirection(XSS.DIRECTION_DOWN);
                break;
        }
    },

    /** @private */
    _getLastDirection: function() {
        return (this.snakeDirectionRequests.length) ?
            this.snakeDirectionRequests[0] :
            this.snakeDirection;
    },

    /** @private */
    _isTurnAllowed: function(turn) {
        // Disallow 0: no turn, 2: bumping into torso
        return turn === 1 || turn === 3;
    },

    /** @private */
    _changeDirection: function(direction) {
        var lastDirection, turn;

        // Allow max of two cached keys
        if (this.snakeDirectionRequests.length <= 2) {
            lastDirection = this._getLastDirection();
            turn = Math.abs(direction - lastDirection);
            if (direction !== lastDirection && this._isTurnAllowed(turn)) {
                this.snakeDirectionRequests.push(direction);
            }
        }
    },

    /** @private */
    _isCrash: function(snakeHead) {
        var x, y, snakePixels = this.snakePixels;

        // Crash into self
        // Head is at end of snakePixels, head cannot crash into own head
        for (var i = 0, m = snakePixels.length - 1; i < m; ++i) {
            x = snakePixels[i][0];
            y = snakePixels[i][1];
            if (x === snakeHead[0] && y === snakeHead[1]) {
                this.snakePixels.splice(i, 1);
                return true;
            }
        }

        // Crash into wall

        // Crash into other player

        return false;
    },

    /** @private */
    _moveSnake: function(diff) {
        var directionShift, snakeHeadTemp;
        this.lastStep += diff;

        if (this.lastStep > this.snakeSpeed) {

            // Prevent 180 degree turns by only allowing one movement per frame
            if (this.snakeDirectionRequests.length) {
                this.snakeDirection = this.snakeDirectionRequests.shift();
            }

            directionShift = this.directionShiftMap[this.snakeDirection];

            snakeHeadTemp = this.snakeHead.slice();
            snakeHeadTemp[0] += directionShift[0];
            snakeHeadTemp[1] += directionShift[1];

            if (this._isCrash(snakeHeadTemp)) {
                this.snakePixels.shift(); // Cut off the tail
                XSS.utils.unsubscribe('/canvas/update', 'movesnake');
                XSS.effects.blink('collision', new PixelEntity(XSS.effects.zoomX4([snakeHeadTemp])), 120);
                XSS.ents.gameover = new PixelEntity(
                    XSS.font.draw(XSS.PIXELS_H / 2 - 30, Math.round(XSS.PIXELS_V / 2.2), 'GAME OVER', true)
                );
            } else {
                this.snakeHead = snakeHeadTemp;
                this.snakePixels = this.snakePixels.reverse();
                this.snakePixels = this.snakePixels.slice(0, this.snakeSize - 1).reverse();
                this.snakePixels.push(this.snakeHead.slice());
                this.lastStep -= this.snakeSpeed;
            }

            XSS.ents.snake.pixels(
                XSS.effects.zoomX4(this.snakePixels)
            );
        }
    }

};