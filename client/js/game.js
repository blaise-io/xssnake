/*jshint globalstrict:true*/
/*globals XSS,PixelEntity,Snake,World,Apple*/

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

        this.setAppleAtRandomPlace();

//        XSS.socket.init(function(socket) {
//            socket.emit('/xss/name', 'Blaise');
//            socket.emit('/xss/game', {'mode': 'XSS', 'room': 'public'});
//            this.addEventHandlers();
//        }.bind(this));

        this._addEventListeners();
    },

    setAppleAtRandomPlace: function() {
        var openspace = this.world.getRandomOpenTile();
        this.apple = new Apple(openspace[0], openspace[1]);
        this.apple.addToEntities();
    },

    /** @private */
    _addEventListeners: function() {
        var tick = this._tick.bind(this);
        XSS.utils.subscribe('/canvas/update', 'tick', tick);
    },

    /**
     * @param {number} diff
     * @private
     */
    _tick: function(diff) {
        this._moveSnakes(diff);
    },

    /**
     * @param {Snake} snake
     * @return {boolean}
     * @private
     */
    _isCrash: function(snake) {

        if (snake.isCrashIntoSelf()) {
            console.log('self');
            return true;
        }

        else if (this.world.isWall(snake.head[0], snake.head[1])) {
            console.log('world');
            return true;
        }

        // TODO: Crash into other snake

        return false;
    },

    /**
     * @param {Snake} snake
     * @return {boolean}
     * @private
     */
    _isNom: function(snake) {
        var apple = this.apple;
        return (snake.head[0] === apple.x && snake.head[1] === apple.y);
    },

    /**
     * @param {number} diff
     * @private
     */
    _moveSnakes: function(diff) {
        var snake;
        for (var i = 0, m = this.snakes.length; i < m; ++i) {
            snake = this.snakes[i];
            if (!snake.crashed && snake.snakeProgress >= snake.speed) {
                snake.move(); // TODO: match against snake.getNextMove();
                if (this._isNom(snake)) {
                    snake.parts += 1;
                    this.setAppleAtRandomPlace();
                }
                if (this._isCrash(snake)) {
                    snake.crash();
                }
                snake.snakeProgress -= snake.speed;
            }
            snake.snakeProgress += diff;
        }
    }

};