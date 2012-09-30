/*jshint globalstrict:true, sub:true*/
/*globals XSS, PixelEntity, Snake, ClientLevel, Apple, Utils*/

'use strict';

/***
 * Game
 * @param {number} levelID
 * @param {Array.<string>} names
 * @param {number} index
 * @constructor
 */
function Game(levelID, names, index) {
    XSS.ents.border = XSS.drawables.outerBorder();
    XSS.ents.levelborder = XSS.drawables.levelBorder();

    this.curid = 0;

    /** @type {ClientLevel} */
    this.level = this.setupLevel(levelID);

    /** @type {Array.<Snake>} */
    this.snakes = this.spawnSnakes(names, index);

    /** @type {Array.<Apple>} */
    this.apples = [];

    this._countDown();
}

Game.prototype = {

    setupLevel: function(levelID) {
        var level = new ClientLevel(levelID);
        XSS.ents.world = level.getEntity();
        return level;
    },

    spawnSnakes: function(names, index) {
        var snakes = [];

        for (var i = 0, m = names.length; i < m; i++) {
            var loc, direction, name, snake;

            loc = this.level.getSpawn(i);
            direction = this.level.getSpawnDirection(i);
            name = names[i];

            snake = new Snake(++this.curid, loc[0], loc[1], direction, name);
            snake.addToEntities();
            snake.showName();

            if (i === index) {
                snake.local = true;
                snake.addControls();
            }

            snakes.push(snake);
        }

        return snakes;
    },

    snakeSize: function(index, size) {
        XSS.game.snakes[index].size = size;
    },

    _countDown: function() {
    },

    start: function() {
        var tick = this._onTick.bind(this);
        XSS.pubsub.subscribe('/canvas/update', 'tick', tick);
    },

    /**
     * @param {number} delta
     * @private
     */
    _onTick: function(delta) {
        this._moveSnakes(delta);
    },

    /**
     * @param {Snake} snake
     * @param {Array.<number>} position
     * @return {boolean}
     * @private
     */
    _isCrash: function(snake, position) {

        if (this.level.isWall(position[0], position[1])) {
            console.log('level');
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
     * @param {number} delta
     * @private
     */
    _moveSnakes: function(delta) {
        for (var i = 0, m = this.snakes.length; i < m; ++i) {
            var snake = this.snakes[i];
            if (snake.snakeProgress >= snake.speed && !snake.crashed) {
                this._moveSnake(snake);
                snake.snakeProgress -= snake.speed;
            }
            snake.snakeProgress += delta;
        }
    },

    _moveSnake: function(snake) {
        var position = snake.getNextPosition();
        snake.move(position); // Multiplayer

//        var index, position;
//
//        position = snake.getNextPosition();
//
//        if (this._isCrash(snake, position)) {
//            snake.crash();
//        }
//
//        else {
//            snake.move(position);
//            index = this._getAppleAtPosition(position);
//            if (-1 !== index) {
//                this.apples[index].eat();
//                snake.size += 1;
//            }
//        }
    }

};