'use strict';

/***
 * Game
 * @param {xss.room.PlayerRegistry} players
 * @param {xss.level.Level} level
 * @constructor
 */
xss.game.Game = function(players, level) {
    this.level = level;
    this.level.paint();

    this.snakes = new xss.game.SnakeRegistry(this.level);
    this.snakes.setSnakes(players);
    this.snakes.showMeta();

    this.spawnables = new xss.game.SpawnableRegistry();

    this.started = false;

    this._bindEvents();
};

xss.game.Game.prototype = {

    _bindEvents: function() {
        var ns = xss.NS_GAME;

        xss.event.on(xss.PUB_GAME_TICK,        ns, this._clientGameLoop.bind(this));

        // @todo put in SpawnableRegistry
        xss.event.on(xss.EVENT_GAME_SPAWN,     ns, this._evSpawn.bind(this));
        xss.event.on(xss.EVENT_GAME_DESPAWN,   ns, this._evSpawnHit.bind(this));

        // @todo put in SnakeRegistry
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

        this.started = true;
        this.snakes.removeMeta();
        this.snakes.addControls();
    },

    destruct: function() {
        xss.event.off(xss.PUB_GAME_TICK, xss.NS_GAME);
        xss.event.off(xss.EVENT_GAME_SPAWN, xss.NS_GAME);
        xss.event.off(xss.EVENT_SNAKE_UPDATE, xss.NS_GAME);
        xss.event.off(xss.EVENT_SNAKE_SIZE, xss.NS_GAME);
        xss.event.off(xss.EVENT_SNAKE_CRASH, xss.NS_GAME);
        xss.event.off(xss.EVENT_SNAKE_ACTION, xss.NS_GAME);
        xss.event.off(xss.EVENT_SNAKE_SPEED, xss.NS_GAME);

        this.snakes.destruct();
        this.spawnables.destruct();
        this.level.destruct();
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
        snake.crash(data[2]);
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
     * @param {boolean} focus
     * @private
     */
    _handleFocus: function(focus) {
        if (focus && xss.socket) {
            xss.socket.emit(xss.EVENT_GAME_STATE);
        }
    },

    /**
     * Runs ~ every 16 ms (60 fps)
     * @param {number} delta
     * @private
     */
    _clientGameLoop: function(delta) {
        var shift = this.level.gravity.getShift(delta);

//        movingWalls = this.level.updateMovingWalls(delta, this.model.started);
//        this._updateMovingWalls(movingWalls);

        if (this.started) {
            this.snakes.move(delta, shift);
        }
    }//,

//    /**
//     * @param {Array.<xss.ShapeCollection>} shapeCollections
//     * @private
//     */
//    _updateMovingWalls: function(shapeCollections) {
//        for (var i = 0, m = shapeCollections.length; i < m; i++) {
//            if (shapeCollections[i]) {
//                this._updateShapes(i, shapeCollections[i]);
//            }
//        }
//    },

//    /**
//     * @param {number} index
//     * @param {xss.ShapeCollection} shapeCollection
//     * @private
//     * @deprecated
//     */
//    _updateShapes: function(index, shapeCollection) {
//        var shapes = shapeCollection.shapes;
//        for (var i = 0, m = shapes.length; i < m; i++) {
//            var key = xss.NS_ANIM + index + '_' + i;
//            if (shapes[i]) {
//                if (!shapes[i].cache) {
//                     shapes[i].setGameTransform();
//                }
//                xss.shapes[key] = shapes[i];
//            } else {
//                xss.shapes[key] = null;
//            }
//        }
//    },
//
//    /**
//     * @param {xss.game.ClientSnake} snake
//     * @param {xss.Coordinate} position
//     * @return {xss.ClientCrash}
//     * @private
//     */
//    _isCrash: function(snake, position) {
//        var part, predictSnakeParts = snake.parts.slice();
//        predictSnakeParts[predictSnakeParts.length - 1] = position;
//
//        // Walls.
//        part = this._isCrashIntoWall(predictSnakeParts);
//        if (part) {
//            return new xss.ClientCrash(part);
//        }
//
//        // Animating walls.
//        part = this._isCrashIntoAnimated(predictSnakeParts);
//        if (part) {
//            return new xss.ClientCrash(part);
//        }
//
//        // Own tail.
//        if (snake.parts.length >= 5 && snake.hasPartPredict(position)) {
//            if (snake.getPartIndex(position) !== snake.parts.length - 1) {
//                return new xss.ClientCrash(snake.parts[0]);
//            }
//        }
//
//        // Other snake.
//        for (var i = 0, m = this.snakes.length; i < m; i++) {
//            var opponent = this.snakes[i];
//            if (opponent !== snake && opponent.hasPartPredict(position)) {
//                return new xss.ClientCrash();
//            }
//        }
//
//        return null;
//    },
//
//    /**
//     * @param {xss.game.SnakeParts} parts
//     * @return {xss.Coordinate}
//     * @private
//     */
//    _isCrashIntoWall: function(parts) {
//        for (var i = 0, m = parts.length; i < m; i++) {
//            if (this.level.isWall(parts[i][0], parts[i][1])) {
//                return parts[i];
//            }
//        }
//        return null;
//    },
//
//    /**
//     * @param {xss.game.SnakeParts} parts
//     * @return {xss.Coordinate}
//     * @private
//     */
//    _isCrashIntoAnimated: function(parts) {
//        for (var i = 0, m = parts.length; i < m; i++) {
//            if (this.level.getMovingWalls(parts[i])) {
//                return parts[i];
//            }
//        }
//        return null;
//    }

};
