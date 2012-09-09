/*jshint globalstrict:true, sub:true*/
/*globals XSS, PixelEntity, Snake, World, Apple*/

'use strict';

/**
 * Game
 * @constructor
 */
function Game(data) {
    XSS.ents.border = XSS.drawables.getOuterBorder();
    XSS.ents.levelborder = XSS.drawables.getLevelBorder();

    this.world = new World(data['level']);
    this.world.addToEntities();

    this.snakeInc = 0;

    this.snakes = this.spawnSnakes(data);

    this.apples = [];

    this._addEventListeners();
}

Game.prototype = {

    spawnSnakes: function(data) {
        var snakes = [], player, direction, snake;

        for (var i = 0, m = data['names'].length; i < m; i++) {
            player = this.world.getSpawn(i);
            direction = this.world.getSpawnDirection(i);

            snake = new Snake(++this.snakeInc, player[0], player[1], direction);
            snake.addToEntities();

            if (i === data['index']) {
                snake.local = true;
                snake.addControls();
            }

            snakes.push(snake);
        }

        return snakes;
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
        var tick = this._onTick.bind(this);
        XSS.utils.subscribe('/canvas/update', 'tick', tick);
    },

    /**
     * @param {number} diff
     * @private
     */
    _onTick: function(diff) {
        this._moveSnakes(diff);
    },

    /**
     * @param {Snake} snake
     * @param {Array.<number>} position
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
                snake.size += 1;
            }
        }
    }

};