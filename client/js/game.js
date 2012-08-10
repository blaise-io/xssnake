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

        this.world = new World(2);
        this.world.addToEntities();

        this.snakes = [this.spawnLocalSnake()];
        this.apples = [this.spawnApple()];

//        XSS.socket.init(function(socket) {
//            socket.emit('/xss/name', 'Blaise');
//            socket.emit('/xss/game', {'mode': 'XSS', 'room': 'public'});
//            this.addEventHandlers();
//        }.bind(this));

        this._addEventListeners();
    },

    /**
     * @param pixels {Array.<Array>}
     * @return {Array.<Array>}
     */
    zoom: function(pixels) {
        return XSS.effects.zoomX4(pixels, XSS.GAME_LEFT, XSS.GAME_TOP);
    },

    /**
     * @return {Snake}
     */
    spawnLocalSnake: function() {
        var snake, player = this.world.getPlayer(1);

        snake = new Snake(player[0], player[1], XSS.DIRECTION_RIGHT);
        snake.addControls();
        snake.addToEntities();

        return snake;
    },

    /**
     * @return {Apple}
     */
    spawnApple: function() {
        var apple, tile = this.world.getRandomOpenTile();
        apple = new Apple(tile[0], tile[1]);
        apple.addToEntities();
        return apple;
    },

    /**
     * @param {number} index
     */
    respawnApple: function(index) {
        this.apples[index] = this.spawnApple();
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
     * @param {Array.<Array>} position
     * @return {boolean}
     * @private
     */
    _isCrash: function(snake, position) {

        if (this.world.isWall(position[0], position[1])) {
            console.log('world');
            return true;
        }

        if (!snake.isHead(position) && snake.hasPartPredict(position)) {
            console.log('self');
            return true;
        }

        for (var i = 0, m = this.snakes.length; i < m; i++) {
            var matchSnake = this.snakes[i];
            if (matchSnake !== snake && matchSnake.hasPartPredict(position)) {
                console.log('opponent');
                return true;
            }
        }

        return false;
    },

    /**
     * @param {Array.<number>} move
     * @return {number}
     * @private
     */
    _getAppleAtPosition: function(move) {
        for (var i = 0, m = this.apples.length; i < m; ++i) {
            var apple = this.apples[i];
            if (move[0] === apple.x && move[1] === apple.y) {
                return i;
            }
        }
        return -1;
    },

    /**
     * @param {number} diff
     * @private
     */
    _moveSnakes: function(diff) {
        for (var i = 0, m = this.snakes.length; i < m; ++i) {
            var snake = this.snakes[i];
            if (snake.snakeProgress >= snake.speed && !snake.crashed) {
                this._moveSnake(snake);
                snake.snakeProgress -= snake.speed;
            }
            snake.snakeProgress += diff;
        }
    },

    _moveSnake: function(snake) {
        var index, position;

        position = snake.getNextPosition();

        if (this._isCrash(snake, position)) {
            snake.crash();
        }

        else {
            snake.move(position);
            index = this._getAppleAtPosition(position);
            if (-1 !== index) {
                this.apples[index].eat();
                this.respawnApple(index);
                snake.parts += 1;
            }
        }
    }

};