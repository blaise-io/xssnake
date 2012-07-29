/*jshint globalstrict:true*/
/*globals XSS,PixelEntity,Snake,World,Apple*/

'use strict';

/**
 * Game
 * @constructor
 */
function Game() {
}

Game.prototype = {

    init: function() {

        XSS.ents.border = XSS.drawables.getOuterBorder();
        XSS.ents.levelborder = XSS.drawables.getLevelBorder();

        this.world = new World(2);
        this.world.addToEntities();

        this.snakes = [this.spawnLocalSnake()];
        this.apple = this.spawnApple();

//        XSS.socket.init(function(socket) {
//            socket.emit('/xss/name', 'Blaise');
//            socket.emit('/xss/game', {'mode': 'XSS', 'room': 'public'});
//            this.addEventHandlers();
//        }.bind(this));

        this._addEventListeners();
    },

    zoom: function(pixels) {
        return XSS.effects.zoomX4(pixels, XSS.GAME_LEFT, XSS.GAME_TOP);
    },

    spawnLocalSnake: function() {
        var snake, player = this.world.getPlayer(1);

        snake = new Snake(player[0], player[1], XSS.DIRECTION_RIGHT);
        snake.addControls();
        snake.addToEntities();

        return snake;
    },

    spawnApple: function() {
        var apple, tile = this.world.getRandomOpenTile();
        apple = new Apple(tile[0], tile[1]);
        apple.addToEntities();
        return apple;
    },

    respawnApple: function() {
        this.apple = null;
        XSS.effects.delay(function() {
            this.apple = this.spawnApple();
        }.bind(this), 100);
    },

    /** @private */
    _addEventListeners: function() {
        var tick = this._tick.bind(this);
        XSS.utils.subscribe('/canvas/update', 'tick', tick);
    },

    /**
     * @param {number} diff
     * @private
     */
    _tick: function(diff) {
        this._moveSnakes(diff);
    },

    /**
     * @param {Snake} snake
     * @return {boolean}
     * @private
     */
    _isCrash: function(snake) {

        if (snake.isCrashIntoSelf()) {
            console.log('self');
            return true;
        }

        else if (this.world.isWall(snake.head[0], snake.head[1])) {
            console.log('world');
            return true;
        }

        // TODO: Crash into other snake

        return false;
    },

    /**
     * @param {Snake} snake
     * @param {Apple} apple
     * @return {boolean}
     * @private
     */
    _isNom: function(snake, apple) {
        return (snake.head[0] === apple.x && snake.head[1] === apple.y);
    },

    /**
     * @param {number} diff
     * @private
     */
    _moveSnakes: function(diff) {
        var snake;
        for (var i = 0, m = this.snakes.length; i < m; ++i) {
            snake = this.snakes[i];
            if (!snake.crashed && snake.snakeProgress >= snake.speed) {
                snake.move(); // TODO: match against snake.getNextMove();
                if (this.apple && this._isNom(snake, this.apple)) {
                    this.apple.eat();
                    snake.parts += 1;
                    this.respawnApple();
                }
                if (this._isCrash(snake)) {
                    snake.crash();
                }
                snake.snakeProgress -= snake.speed;
            }
            snake.snakeProgress += diff;
        }
    }

};