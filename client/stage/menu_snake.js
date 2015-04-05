'use strict';

/**
 * @constructor
 */
xss.stage.MenuSnake = function() {
    this.snake = null;
    this.timeouts = [];
    this.level = new xss.levels.BlankLevel(new xss.levelset.Config());
    this.level.preload(this.construct.bind(this));
};

xss.stage.MenuSnake.prototype = {

    construct: function() {
        var snake;

        snake = new xss.game.ClientSnake(0, false, '', this.level);
        snake.addControls();
        snake.showDirection();
        snake.removeNameAndDirection();

        this.snake = snake;
        this.timeouts.push(
            setTimeout(this.move.bind(this), 1500)
        );
    },

    destruct: function() {
        for (var i = 0, m = this.timeouts.length; i < m; i++) {
            clearTimeout(this.timeouts[i]);
        }
        this.snake.destruct();
        this.level.destruct();
    },

    move: function() {
        var nextpos, snake = this.snake;

        snake.collision = null;

        nextpos = snake.getNextPosition();
        if (this.isCrash(snake, nextpos)) {
            snake.setCrashed();
            this.timeouts.push(
                setTimeout(snake.destruct.bind(snake), 2200)
            );
        } else {
            snake.elapsed = 1000; // Trigger move.
            snake.move(snake.getNextPosition());
            snake.updateShape();
            this.timeouts.push(
                setTimeout(this.move.bind(this), 100)
            );
        }
    },

    /**
     * @param {xss.game.ClientSnake} snake
     * @param {xss.Coordinate} nextpos
     * @return {boolean}
     */
    isCrash: function(snake, nextpos) {
        var snakeShape = snake.getShape(), crash = false;
        if (nextpos[0] < 0 || nextpos[1] < 0) {
            return true;
        } else if (snakeShape) {
            var pixels = xss.transform.zoom(
                4, snakeShape.pixels, xss.GAME_LEFT, xss.GAME_TOP, false
            );
            pixels.each(function(x, y) {
                if (this.overlaysShape(snakeShape, x, y)) {
                    crash = true;
                }
            }.bind(this));
        }
        return crash;
    },

    /**
     * @param {xss.Shape} snakeShape
     * @param {number} x
     * @param {number} y
     * @return {boolean}
     */
    overlaysShape: function(snakeShape, x, y) {
        for (var k in xss.shapes) {
            if (xss.shapes.hasOwnProperty(k) && xss.shapes[k] !== snakeShape) {
                if (xss.shapes[k] && xss.shapes[k].pixels.has(x, y)) {
                    return true;
                }
            }
        }
        return false;
    }

};
