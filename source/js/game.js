/*jshint globalstrict:true, sub:true*/
/*globals XSS, ClientSnake, ClientLevel, Apple, Shape */

'use strict';

/***
 * Game
 * @param {number} levelID
 * @param {Array.<string>} names
 * @param {number} index
 * @constructor
 */
function Game(levelID, names, index, apples) {

    XSS.stageflow.stage.destroyStage();

    XSS.shapes = {
        border: XSS.shapegen.outerBorder(),
        levelborder: XSS.shapegen.levelBorder()
    };

    this.curid = 0;

    this.level  = this._setupLevel(levelID);
    this.snakes = this._spawnSnakes(names, index);
    this.apples = this._spawnApples(apples);

    this._countDown();
}

Game.prototype = {

    start: function() {
        window.onfocus = this._reIndexClient.bind(this);
        XSS.pubsub.subscribe(XSS.GAME_TICK, '', this._tick.bind(this));
        this.addControls();
    },

    destruct: function() {
        XSS.pubsub.unsubscribe(XSS.GAME_TICK, '');
        this.removeControls();
    },

    addControls: function() {
        for (var i = 0, m = this.snakes.length; i < m; i++) {
            if (this.snakes[i].local) {
                this.snakes[i].addControls();
            }
        }
    },

    removeControls: function() {
        for (var i = 0, m = this.snakes.length; i < m; i++) {
            this.snakes[i].removeControls();
        }
    },

    _reIndexClient: function() {
        XSS.socket.emit(XSS.events.SERVER_GAME_REINDEX);
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
        XSS.shapes.world = level.getShape();
        return level;
    },

    /**
     * @param {Array.<string>} names
     * @param {number} index
     * @return {Array.<ClientSnake>}
     * @private
     */
    _spawnSnakes: function(names, index) {
        var snakes = [], size, speed;

        size = XSS.config.shared.snake.size;
        speed = XSS.config.shared.snake.speed;

        for (var i = 0, m = names.length; i < m; i++) {
            var location, direction, snake, local;

            location = this.level.getSpawn(i);
            direction = this.level.getSpawnDirection(i);
            local = i === index;

            snake = new ClientSnake(i, location, direction, size, speed, local);
            snake.name = names[i];
            snake.addToEntities();
            snake.showName();

            snakes.push(snake);
        }

        return snakes;
    },

    /**
     * @param {Array.<Array.<number>>} locations
     * @return {Array.<Apple>}
     * @private
     */
    _spawnApples: function(locations) {
        var apples = [];
        for (var i = 0, m = locations.length; i < m; i++) {
            apples.push(new Apple(i, locations[i][0], locations[i][1]));
        }
        return apples;
    },

    _countDown: function() {
        var count, total,  x, y;

        count = XSS.config.shared.game.countdown;
        total = count;
        x = -8 + XSS.PIXELS_H / 2;
        y = -22 + XSS.PIXELS_V / 2;

        do {
            var pixels, shape, start, stop;
            start = (total - count) * 1000;
            stop = start + 1000;

            pixels = XSS.font.pixels(0, 0, String(count));

            shape = new Shape(XSS.transform.zoomX4(pixels, x, y));
            shape.lifetime(start, stop, true);
            shape.bbox().expand(4);
            shape.clip = true;

            XSS.overlays['GC' + count] = shape;
        } while (--count);
    },

    /**
     * @param {number} delta
     * @private
     */
    _moveSnakes: function(delta) {
        for (var i = 0, m = this.snakes.length; i < m; i++) {
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

        // Don't show a snake moving inside a wall, which is caused by latency.
        // Server wil update snake on whether it crashed or made a turn in time.
        if (!this._isCrash(snake, position)) {
            snake.move(position);
            snake.updateShape();
        }
    },

    /**
     * @param {ClientSnake} snake
     * @param {Array.<number>} position
     * @return {boolean}
     * @private
     */
    _isCrash: function(snake, position) {

        if (this.level.isWall(position[0], position[1])) {
            console.log('wall');
            return true;
        }

        if (!snake.isHead(position) && snake.hasPartPredict(position)) {
            console.log('self');
            return true;
        }

        for (var i = 0, m = this.snakes.length; i < m; i++) {
            var opponent = this.snakes[i];
            if (opponent !== snake && opponent.hasPartPredict(position)) {
                console.log('opponent');
                return true;
            }
        }

        return false;
    }

};