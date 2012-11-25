/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, ClientSnake, ClientLevel, Shape, Util */
'use strict';

/***
 * Game
 * @param {number} levelID
 * @param {number} index
 * @param {Array.<string>} names
 * @constructor
 */
function Game(index, levelID, names) {

    XSS.stageflow.stage.destroyStage();
    delete XSS.shapes.stage;
    delete XSS.shapes.header;
    delete XSS.shapes.instruction;

    /** @type {Level} */
    this.level = this._setupLevel(levelID);
    this.snakes = this._spawnSnakes(names, index);
    /** @type {Array.<Apple>} */
    this.apples = [];
}

Game.prototype = {

    start: function() {
        window.onfocus = this._getGameState.bind(this);
        XSS.pubsub.subscribe(XSS.GAME_TICK, '', this._tick.bind(this));
        for (var i = 0, m = this.snakes.length; i < m; i++) {
            this.snakes[i].removeNameAndDirection();
        }
        this.addControls();
    },

    destruct: function() {
        var i, m;
        XSS.pubsub.unsubscribe(XSS.GAME_TICK, '');
        for (i = 0, m = this.snakes.length; i < m; i++) {
            this.snakes[i].destruct();
        }
        for (i = 0, m = this.apples.length; i < m; i++) {
            this.apples[i].destruct();
        }
        delete XSS.shapes.border;
        delete XSS.shapes.level;
    },

    addControls: function() {
        for (var i = 0, m = this.snakes.length; i < m; i++) {
            if (this.snakes[i].local) {
                this.snakes[i].addControls();
            }
        }
    },

    _getGameState: function() {
        XSS.socket.emit(XSS.events.SERVER_GAME_STATE);
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
        XSS.shapes.level = level.getShape();
        return level;
    },

    /**
     * @param {Array.<string>} names
     * @param {number} index
     * @return {Array.<ClientSnake>}
     * @private
     */
    _spawnSnakes: function(names, index) {
        var snakes = [];
        for (var i = 0, m = names.length; i < m; i++) {
            var snake = this._spawnSnake(i, names[i], index);
            snakes.push(snake);
        }
        return snakes;
    },

    /**
     * @param {number} i
     * @param {string} name
     * @param {number} index
     * @return {ClientSnake}
     * @private
     */
    _spawnSnake: function(i, name, index) {
        var location, direction, snake;

        location = this.level.getSpawn(i);
        direction = this.level.getSpawnDirection(i);

        snake = new ClientSnake(i, i === index, name, location, direction);
        snake.addToEntities();
        snake.showName();

        if (i === index) {
            snake.showDirection();
        }

        return snake;
    },

    countdown: function() {
        var count, total, border, line = XSS.shapegen.line;

        count = XSS.config.shared.game.countdown;
        total = count;

        do {
            var pixels, shape, bbox, start;
            start = (total - count) * 1000;

            pixels = XSS.font.pixels(0, 0, String(count).replace(/^0$/,'Go!'));

            shape = new Shape(XSS.transform.zoomX2(pixels));
            bbox = shape.bbox();

            shape.shift(
                Math.floor(XSS.PIXELS_H / 2 - bbox.width / 2),
                Math.floor(XSS.PIXELS_V / 2 - bbox.height / 2) - 12
            );

            // Make "Go" fit
            bbox = shape.bbox().expand(4);
            bbox.y1 -= 1;
            bbox.x1 -= 9;
            bbox.x2 += 9;

            if (!border) {
                border = [
                    line(bbox.x1 + 1, bbox.y1, bbox.x2 - 1, bbox.y1),
                    line(bbox.x1 + 1, bbox.y2, bbox.x2 - 1, bbox.y2),
                    line(bbox.x1 + 1, bbox.y1 + 1, bbox.x2 - 1, bbox.y1 + 1),
                    line(bbox.x1 + 1, bbox.y2 - 1, bbox.x2 - 1, bbox.y2 - 1),
                    line(bbox.x1, bbox.y1 + 1, bbox.x1, bbox.y2 - 1),
                    line(bbox.x2, bbox.y1 + 1, bbox.x2, bbox.y2 - 1),
                    line(bbox.x1 + 1, bbox.y1 + 1, bbox.x1 + 1, bbox.y2 - 1),
                    line(bbox.x2 - 1, bbox.y1 + 1, bbox.x2 - 1, bbox.y2 - 1)
                ];
            }

            shape.add.apply(shape, border);
            shape.lifetime(start, start + 1000, true);
            shape.clip = true;

            XSS.overlays['GC' + count] = shape;
        } while (count--);
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

        snake.move(position);

        // Don't show a snake moving inside a wall, which is caused by latency.
        // Server wil update snake on whether it crashed or made a turn in time.
        if (this._isCrash(snake, position)) {
            snake.limbo = true;
        } else if (!snake.limbo) {
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
            return true;
        }

        if (snake.parts.length >= 5 && snake.hasPartPredict(position)) {
            if (snake.partIndex(position) !== snake.parts.length - 1) {
                return true;
            }
        }

        for (var i = 0, m = this.snakes.length; i < m; i++) {
            var opponent = this.snakes[i];
            if (opponent !== snake && opponent.hasPartPredict(position)) {
                return true;
            }
        }

        return false;
    }

};