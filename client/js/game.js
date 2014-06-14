'use strict';

/***
 * Game
 * @param {number} index
 * @param {number} levelIndex
 * @param {Array.<string>} names
 * @param {number=} created
 * @constructor
 */
xss.Game = function(index, levelIndex, names, created) {
    xss.canvas.garbageCollect();

    // Todo: Move to stage, add as netcode listener.
    if (xss.flow.stage) {
        xss.flow.stage.destruct();
    }

    xss.shapes.stage = null;
    xss.shapes.header = null;
    xss.shapes.border = null;

    this.model = new xss.model.ClientGame(created);

    /** @type {xss.Level} */
    this.level = this._setupLevel(levelIndex);

    /** @type {Array.<xss.ClientSnake>} */
    this.snakes = this._spawnSnakes(names, index);

    /** @type {Array.<xss.Spawnable>} */
    this.spawnables = [];

    this._bindEvents();
};

xss.Game.prototype = {

    _bindEvents: function() {
        var ns = xss.NS_GAME;
        xss.event.on(xss.PUB_GAME_TICK,        ns, this._clientGameLoop.bind(this));
        xss.event.on(xss.EVENT_GAME_COUNTDOWN, ns, this.countdown.bind(this));
        xss.event.on(xss.EVENT_GAME_START,     ns, this.start.bind(this));
        xss.event.on(xss.EVENT_GAME_SPAWN,     ns, this._evSpawn.bind(this));
        xss.event.on(xss.EVENT_GAME_DESPAWN,   ns, this._evSpawnHit.bind(this));
        xss.event.on(xss.EVENT_SNAKE_UPDATE,   ns, this._evSnakeUpdate.bind(this));
        xss.event.on(xss.EVENT_SNAKE_SIZE,     ns, this._evSnakeSize.bind(this));
        xss.event.on(xss.EVENT_SNAKE_CRASH,    ns, this._evSnakeCrash.bind(this));
        xss.event.on(xss.EVENT_SNAKE_ACTION,   ns, this._evSnakeAction.bind(this));
        xss.event.on(xss.EVENT_SNAKE_SPEED,    ns, this._evSnakeSpeed.bind(this));
    },

    /**
     * A Game does not start immediately after a new instance of the Game class
     * is created. It will show the snakes, level, name labels and directions
     * until this function is called.
     */
    start: function() {
        xss.event.on(
            xss.PUB_WIN_FOCUS_CHANGE,
            xss.NS_GAME,
            this._handleFocus.bind(this)
        );

        for (var i = 0, m = this.snakes.length; i < m; i++) {
            this.snakes[i].removeNameAndDirection();
        }

        this.addControls();
        this.model.started = true;
    },

    destruct: function() {
        var i, m, border, ns, k;

        ns = xss.NS_GAME;

        xss.event.off(xss.PUB_GAME_TICK, ns);
        xss.event.off(xss.EVENT_GAME_COUNTDOWN, ns);
        xss.event.off(xss.EVENT_GAME_START, ns);
        xss.event.off(xss.EVENT_GAME_SPAWN, ns);
        xss.event.off(xss.EVENT_SNAKE_UPDATE, ns);
        xss.event.off(xss.EVENT_SNAKE_SIZE, ns);
        xss.event.off(xss.EVENT_SNAKE_CRASH, ns);
        xss.event.off(xss.EVENT_SNAKE_ACTION, ns);
        xss.event.off(xss.EVENT_SNAKE_SPEED, ns);

        for (i = 0, m = this.snakes.length; i < m; i++) {
            if (this.snakes[i]) {
                this.snakes[i].destruct();
            }
        }

        for (i = 0, m = this.spawnables.length; i < m; i++) {
            if (this.spawnables[i]) {
                this.spawnables[i].destruct();
            }
        }

        for (k in xss.shapes) {
            if (xss.shapes.hasOwnProperty(k)) {
                if (0 === k.indexOf(xss.NS_ANIM)) {
                    xss.shapes[k] = null;
                }
            }
        }

        border = xss.shapegen.outerBorder();
        for (k in border) {
            if (border.hasOwnProperty(k)) {
                xss.shapes[k] = null;
            }
        }

        this.spawnables = [];
        xss.shapes.level = null;
    },

    addControls: function() {
        for (var i = 0, m = this.snakes.length; i < m; i++) {
            this.snakes[i].addControls();
        }
    },

    countdown: function() {
        var from, body, dialog, updateShape, timer;

        xss.room.unbindKeys();

        from = xss.TIME_ROUND_COUNTDOWN;
        body = 'Game starting in: %d';

        dialog = new xss.Dialog('GET READY!', body.replace('%d', from));

        updateShape = function() {
            if (--from > 0) {
                dialog.setBody(body.replace('%d', from));
            } else {
                dialog.destruct();
                clearTimeout(timer);
            }
        };

        timer = window.setInterval(updateShape, 1e3);
    },

    _evSpawn: function(data) {
        var spawn, type = data[0], index = data[1];
        spawn = new xss.Spawnable(type, index, data[2]);
        this.spawnables[index] = spawn;
    },

    /**
     * @param {number} index
     */
    _evSpawnHit: function(index) {
        var spawnable = this.spawnables[index];
        if (spawnable) {
            spawnable.destruct();
            spawnable[index] = null;
        }
    },

    /**
     * @param {Array} data
     */
    _evSnakeUpdate: function(data) {
        var snake = this.snakes[data[0]];
        snake.limbo = false;
        snake.parts = data[1];
        snake.direction = data[2];
    },

    /**
     * @param {Array} data
     */
    _evSnakeSize: function(data) {
        this.snakes[data[0]].size = data[1];
    },

    /**
     * @param {Array} data
     */
    _evSnakeCrash: function(data) {
        var snake = this.snakes[data[0]];
        snake.parts = data[1];
        snake.crash();
    },

    /**
     * @param {Array} data
     */
    _evSnakeAction: function(data) {
        this.snakes[data[0]].showAction(data[1]);
    },

    /**
     * @param {Array} data
     */
    _evSnakeSpeed: function(data) {
        this.snakes[data[0]].speed = data[1];
    },

    /**
     * @param {number} index
     * @return {xss.Level}
     * @private
     */
    _setupLevel: function(index) {
        var levelData, border;

        levelData = xss.levels.getLevelData(index);

        xss.shapes.level = xss.shapegen.level(levelData);
        xss.shapes.innerborder = xss.shapegen.innerBorder();

        border = xss.shapegen.outerBorder();
        for (var k in border) {
            if (border.hasOwnProperty(k)) {
                xss.shapes[k] = border[k];
            }
        }

        return new xss.Level(levelData, this.model.offsetDelta);
    },

    /**
     * @param {Array.<string>} names
     * @param {number} index
     * @return {Array.<xss.ClientSnake>}
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
     * @return {xss.ClientSnake}
     * @private
     */
    _spawnSnake: function(i, name, index) {
        var location, direction, snake;

        location = this.level.getSpawn(i);
        direction = this.level.getSpawnDirection(i);

        snake = new xss.ClientSnake(i, i === index, name, location, direction);
        snake.showName();

        if (this.level.levelData.wind) {
            snake.wind = new xss.Wind(this.level.levelData.wind);
        }

        if (i === index) {
            snake.showDirection();
        }

        return snake;
    },

    /**
     * @param {boolean} focus
     * @private
     */
    _handleFocus: function(focus) {
        if (focus) {
            xss.socket.emit(xss.EVENT_GAME_STATE);
        }
    },

    /**
     * Runs ~ every 16 ms (60 fps)
     * @param {number} delta
     * @private
     */
    _clientGameLoop: function(delta) {
        var movingWalls = this.level.updateMovingWalls(delta, this.model.started);
        this._updateMovingWalls(movingWalls);

        if (this.model.started) {
            this._moveSnakes(delta);
        }
    },

    /**
     * @param {Array.<xss.ShapeCollection>} shapeCollections
     * @private
     */
    _updateMovingWalls: function(shapeCollections) {
        for (var i = 0, m = shapeCollections.length; i < m; i++) {
            if (shapeCollections[i]) {
                this._updateShapes(i, shapeCollections[i]);
            }
        }
    },

    /**
     * @param {number} index
     * @param {xss.ShapeCollection} shapeCollection
     * @private
     */
    _updateShapes: function(index, shapeCollection) {
        var shapes = shapeCollection.shapes;
        for (var i = 0, m = shapes.length; i < m; i++) {
            var key = xss.NS_ANIM + index + '_' + i;
            if (shapes[i]) {
                if (!shapes[i].cache) {
                     shapes[i].setGameTransform();
                }
                xss.shapes[key] = shapes[i];
            } else {
                xss.shapes[key] = null;
            }
        }
    },

    /**
     * @todo Move to Snake class.
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
            snake.applyWind(delta);
            snake.elapsed += delta;
        }
    },

    /**
     * @param {xss.ClientSnake} snake
     * @private
     */
    _moveSnake: function(snake) {
        var position = snake.getNextPosition();

        // Don't show a snake moving inside a wall, which is caused by latency.
        // Server wil update snake on whether it crashed or made a turn in time.
        if (this._isCrash(snake, position)) {
            snake.limbo = true;
        } else if (!snake.limbo) {
            snake.move(position);
            snake.updateShape();
        }
    },

    /**
     * @param {xss.ClientSnake} snake
     * @param {Array.<number>} position
     * @return {boolean}
     * @private
     */
    _isCrash: function(snake, position) {
        var predictSnakeParts = snake.parts.slice();
        predictSnakeParts[predictSnakeParts.length - 1] = position;

        // Walls.
        if (this._isCrashIntoWall(predictSnakeParts)) {
            return true;
        }

        // Animating walls.
        if (this._isCrashIntoAnimated(predictSnakeParts)) {
            return true;
        }

        // Own tail.
        if (snake.parts.length >= 5 && snake.hasPartPredict(position)) {
            if (snake.partIndex(position) !== snake.parts.length - 1) {
                return true;
            }
        }

        // Other snake.
        for (var i = 0, m = this.snakes.length; i < m; i++) {
            var opponent = this.snakes[i];
            if (opponent !== snake && opponent.hasPartPredict(position)) {
                return true;
            }
        }

        return false;
    },

    /**
     * @param {xss.SnakeParts} parts
     * @returns {boolean}
     * @private
     */
    _isCrashIntoWall: function(parts) {
        for (var i = 0, m = parts.length; i < m; i++) {
            if (this.level.isWall(parts[i][0], parts[i][1])) {
                return true;
            }
        }
        return false;
    },

    /**
     * @param {xss.SnakeParts} parts
     * @returns {boolean}
     * @private
     */
    _isCrashIntoAnimated: function(parts) {
        for (var i = 0, m = parts.length; i < m; i++) {
            if (this.level.isMovingWall(parts[i][0], parts[i][1])) {
                return true;
            }
        }
        return false;
    }

};
