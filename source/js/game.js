/*jshint globalstrict:true, sub:true*/
/*globals XSS, PixelEntity, ClientSnake, ClientLevel, Apple, Utils*/

'use strict';

/***
 * Game
 * @param {number} levelID
 * @param {Array.<string>} names
 * @param {number} index
 * @constructor
 */
function Game(levelID, names, index, apples) {
    XSS.ents.border = XSS.drawables.outerBorder();
    XSS.ents.levelborder = XSS.drawables.levelBorder();

    this.curid = 0;

    /** @type {ClientLevel} */
    this.level = this._setupLevel(levelID);

    /** @type {Array.<ClientSnake>} */
    this.snakes = this._spawnSnakes(names, index);

    /** @type {Array.<Apple>} */
    this.apples = this._spawnApples(apples);

    this._countDown();
}

Game.prototype = {

    start: function() {
        var tick = this._tick.bind(this);
        XSS.pubsub.subscribe('/canvas/update', 'tick', tick);
    },

    destruct: function() {
        for (var i = 0, m = this.snakes.length; i < m; i++) {
            this.snakes[i].removeControls();
        }
    },

    /**
     * @param {number} delta
     * @private
     */
    _tick: function(delta) {
        this._moveSnakes(delta);
    },

    /**
     * @param {number} levelID
     * @return {ClientLevel}
     * @private
     */
    _setupLevel: function(levelID) {
        var level = new ClientLevel(levelID);
        XSS.ents.world = level.getEntity();
        return level;
    },

    _spawnSnakes: function(names, index) {
        var snakes = [], size, speed;

        size = XSS.config.snake.size;
        speed = XSS.config.snake.speed;

        for (var i = 0, m = names.length; i < m; i++) {
            var location, direction, snake;

            location = this.level.getSpawn(i);
            direction = this.level.getSpawnDirection(i);

            snake = new ClientSnake(i, location, direction, size, speed);
            snake.name = names[i];
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

    _spawnApples: function(locations) {
        var apples = [];
        for (var i = 0, m = locations.length; i < m; i++) {
            apples.push(new Apple(locations[i][0], locations[i][1]));
        }
        return apples;
    },

    _snakeSize: function(index, size) {
        XSS.game.snakes[index].size = size;
    },

    _countDown: function() {
    },

    /**
     * @param {number} delta
     * @private
     */
    _moveSnakes: function(delta) {
        for (var i = 0, m = this.snakes.length; i < m; ++i) {
            var snake = this.snakes[i];
            if (snake.elapsed >= snake.speed && !snake.crashed) {
                snake.elapsed -= snake.speed;
                this._moveSnake(snake);
            }
            snake.elapsed += delta;
        }
    },

    /**
     * @param {ClientSnake} snake
     * @private
     */
    _moveSnake: function(snake) {
        var position = snake.getNextPosition();
        snake.move(position);
        snake.updateEntity();
    }

//    /**
//     * @param {ClientSnake} snake
//     * @param {Array.<number>} position
//     * @return {boolean}
//     * @private
//     */
//    _isCrash: function(snake, position) {
//
//        if (this.level.isWall(position[0], position[1])) {
//            console.log('level');
//            return true;
//        }
//
//        if (!snake.isHead(position) && snake.hasPartPredict(position)) {
//            console.log('self');
//            return true;
//        }
//
//        for (var i = 0, m = this.snakes.length; i < m; i++) {
//            var matchSnake = this.snakes[i];
//            if (matchSnake !== snake && matchSnake.hasPartPredict(position)) {
//                console.log('opponent');
//                return true;
//            }
//        }
//
//        return false;
//    }

};