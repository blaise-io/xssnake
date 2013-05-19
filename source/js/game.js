/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, ClientSnake, Level, Dialog, Shape, Spawnable */
'use strict';

/***
 * Game
 * @param {number} index
 * @param {number} levelID
 * @param {Array.<string>} names
 * @constructor
 */
function Game(index, levelID, names) {

    // Remove old snakes, spawnables
    // Don't do this during gameplay, might affects fps
    XSS.canvas.garbageCollect();

    XSS.flow.stage.destruct();
    XSS.shapes.stage = null;
    XSS.shapes.header = null;
    XSS.shapes.border = null;

    /** @type {Level} */
    this.level = this._setupLevel(levelID);

    /** @type {Array.<ClientSnake>} */
    this.snakes = this._spawnSnakes(names, index);

    /** @type {Array.<Spawnable>} */
    this.spawnables = [];

    this._bindEvents();
}

Game.prototype = {

    start: function() {
        var pubsub = XSS.pubsub, ns = XSS.NS_GAME;

        pubsub.on(XSS.PUB_GAME_TICK, ns, this._moveSnakes.bind(this));
        pubsub.on(XSS.PUB_FOCUS_CHANGE, ns, this._handleFocus.bind(this));

        for (var i = 0, m = this.snakes.length; i < m; i++) {
            this.snakes[i].removeNameAndDirection();
        }
        this.addControls();
    },

    destruct: function() {
        var i, m, border, pubsub, events, ns;

        pubsub = XSS.pubsub;
        events = XSS.events;
        ns = XSS.NS_GAME;

        pubsub.off(events.GAME_COUNTDOWN, ns);
        pubsub.off(events.GAME_START, ns);
        pubsub.off(events.GAME_SPAWN, ns);
        pubsub.off(events.GAME_SNAKE_UPDATE, ns);
        pubsub.off(events.GAME_SNAKE_SIZE, ns);
        pubsub.off(events.GAME_SNAKE_CRASH, ns);
        pubsub.off(events.GAME_SNAKE_ACTION, ns);
        pubsub.off(events.GAME_SNAKE_SPEED, ns);

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

        this.spawnables = [];

        border = XSS.shapegen.outerBorder();
        for (var k in border) {
            if (border.hasOwnProperty(k)) {
                XSS.shapes[k] = null;
            }
        }

        XSS.shapes.level = null;
    },

    addControls: function() {
        for (var i = 0, m = this.snakes.length; i < m; i++) {
            if (this.snakes[i].local) {
                this.snakes[i].addControls();
            }
        }
    },

    countdown: function() {
        var from, body, dialog, updateShape, timer;

        XSS.room.unbindKeys();

        from = XSS.config.TIME_COUNTDOWN_FROM;
        body = 'Game starting in: %d';

        dialog = new Dialog('GET READY!', body.replace('%d', from));

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

    _bindEvents: function() {
        var events = XSS.events, ns = XSS.NS_GAME, pubsub = XSS.pubsub;
        pubsub.on(events.GAME_COUNTDOWN,    ns, this.countdown.bind(this));
        pubsub.on(events.GAME_START,        ns, this.start.bind(this));
        pubsub.on(events.GAME_SPAWN,        ns, this._evSpawn.bind(this));
        pubsub.on(events.GAME_DESPAWN,      ns, this._evSpawnHit.bind(this));
        pubsub.on(events.GAME_SNAKE_UPDATE, ns, this._evSnakeUpdate.bind(this));
        pubsub.on(events.GAME_SNAKE_SIZE,   ns, this._evSnakeSize.bind(this));
        pubsub.on(events.GAME_SNAKE_CRASH,  ns, this._evSnakeCrash.bind(this));
        pubsub.on(events.GAME_SNAKE_ACTION, ns, this._evSnakeAction.bind(this));
        pubsub.on(events.GAME_SNAKE_SPEED,  ns, this._evSnakeSpeed.bind(this));
    },

    _evSpawn: function(data) {
        var spawn, type = data[0], index = data[1];
        spawn = new Spawnable(type, index, data[2]);
        this.spawnables[index] = spawn;
    },


    /**
     * @param {number} index
     */
    _evSpawnHit: function(index) {
        var spawnable = this.spawnables[index];
        spawnable.destruct();
        spawnable[index] = null;
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
     * @param {number} levelID
     * @return {Level}
     * @private
     */
    _setupLevel: function(levelID) {
        var data, border;

        data = XSS.level.levelData(levelID);
        XSS.shapes.level = XSS.shapegen.level(data);

        border = XSS.shapegen.outerBorder();
        for (var k in border) {
            if (border.hasOwnProperty(k)) {
                XSS.shapes[k] = border[k];
            }
        }

        return new Level(data);
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
        snake.addToShapes();
        snake.showName();

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
            XSS.socket.emit(XSS.events.GAME_STATE);
        }
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
