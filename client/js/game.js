/*jshint globalstrict:true*/
/*globals XSS,PixelEntity,Snake,World*/

'use strict';

/**
 * Game
 * @constructor
 */
function Game() {
}

Game.prototype = {

    init: function() {

        XSS.ents.border = XSS.drawables.getOuterBorder();
        XSS.ents.levelborder = XSS.drawables.getLevelBorder();

        this.localSnake = new Snake(4, 4, XSS.DIRECTION_RIGHT);
        this.localSnake.addControls();
        this.localSnake.addToEntities();

        this.snakes = [this.localSnake];

        this.world = new World(1);
        this.world.addToEntities();

//        XSS.socket.init(function(socket) {
//            socket.emit('/xss/name', 'Blaise');
//            socket.emit('/xss/game', {'mode': 'XSS', 'room': 'public'});
//            this.addEventHandlers();
//        }.bind(this));

        this._addEventListeners();
    },

    /** @private */
    _addEventListeners: function() {
        var moveSnakes = this._moveSnakes.bind(this);
        XSS.utils.subscribe('/canvas/update', 'movesnakes', moveSnakes);
    },

    /** @private */
    _isCrash: function(snake) {

        if (snake.isCrashIntoSelf()) {
            console.log('self');
            return true;
        }

        else if (this.world.isCrashIntoWorld(snake.head[0], snake.head[1])) {
            console.log('world');
            return true;
        }

        // TODO: Crash into other snake

        return false;
    },

    /** @private */
    _moveSnakes: function(diff) {
        var snake;
        for (var i = 0, m = this.snakes.length; i < m; ++i) {
            snake = this.snakes[i];
            if (snake.snakeProgress >= snake.speed) {
                if (this._isCrash(snake)) {
                    XSS.utils.unsubscribe('/canvas/update', 'movesnakes');
                    snake.crash();
                } else {
                    snake.move();
                }
                snake.snakeProgress -= snake.speed;
            }
            snake.snakeProgress += diff;
        }
    }

};