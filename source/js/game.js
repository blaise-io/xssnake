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
        XSS.stageflow.stage.destroyStage();
        XSS.shapes = {
            border     : XSS.shapegen.outerBorder(),
            levelborder: XSS.shapegen.levelBorder(),
            world      : level.getShape()
        };
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

    _spawnSnake: function(i, name, index) {
        var location, direction, snake;

        location = this.level.getSpawn(i);
        direction = this.level.getSpawnDirection(i);

        snake = new ClientSnake(i, i === index, name, location, direction);
        snake.addToEntities();
        snake.showName();

        if (i === index) {
            snake.flashDirection();
        }

        return snake;
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