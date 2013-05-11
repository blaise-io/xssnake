/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, ClientSnake, ClientLevel, Dialog, Shape */
'use strict';

/***
 * Game
 * @param {number} levelID
 * @param {number} index
 * @param {Array.<string>} names
 * @constructor
 */
function Game(index, levelID, names) {

    // Remove old snakes, apples and power-ups.
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
    /** @type {Array.<Apple>} */
    this.apples = [];
    /** @type {Array.<Powerup>} */
    this.powerups = [];
}

Game.prototype = {

    start: function() {
        var sub = XSS.pubsub.on.bind(XSS.pubsub);

        sub(XSS.PUB_GAME_TICK, XSS.PUB_NS_GAME, this._moveSnakes.bind(this));
        sub(XSS.PUB_FOCUS_CHANGE, XSS.PUB_NS_GAME, this._handleFocus.bind(this));

        for (var i = 0, m = this.snakes.length; i < m; i++) {
            this.snakes[i].removeNameAndDirection();
        }
        this.addControls();
    },

    destruct: function() {
        var i, m, border;

        XSS.pubsub.off(XSS.PUB_GAME_TICK, XSS.PUB_NS_GAME);
        XSS.pubsub.off(XSS.PUB_FOCUS_CHANGE, XSS.PUB_NS_GAME);

        for (i = 0, m = this.snakes.length; i < m; i++) {
            if (this.snakes[i]) {
                this.snakes[i].destruct();
            }
        }

        for (i = 0, m = this.apples.length; i < m; i++) {
            if (this.apples[i]) {
                this.apples[i].destruct();
            }
        }

        for (i = 0, m = this.powerups.length; i < m; i++) {
            if (this.powerups[i]) {
                this.powerups[i].destruct();
            }
        }

        this.apples = [];
        this.powerups = [];

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
        var from, body, settings, dialog, updateShape, timer;

        from = XSS.config.TIME_COUNTDOWN_FROM;
        body = 'Game starting in: %d';
        settings = {blockKeys: false};

        dialog = new Dialog('GET READY!', body.replace('%d', from), settings);

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

    /**
     * @param {number} levelID
     * @return {ClientLevel}
     * @private
     */
    _setupLevel: function(levelID) {
        var border, level = new ClientLevel(levelID);
        XSS.shapes.level = level.getShape();

        border = XSS.shapegen.outerBorder();
        for (var k in border) {
            if (border.hasOwnProperty(k)) {
                XSS.shapes[k] = border[k];
            }
        }

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
            XSS.socket.emit(XSS.events.SERVER_GAME_STATE);
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
