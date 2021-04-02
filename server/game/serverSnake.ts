/**
 * @param {number} index
 * @param {level.Level} level
 * @extends {game.Snake}
 * @constructor
 */
export class ServerSnake {
    constructor(ServerSnake) {
    game.Snake.call(this, index, level);
    this.index = index;
    this.level = level;
    /** @type {game.SnakeMove} */
    this.collision = null;
    this.elapsed = 0;
};

/** @lends {game.ClientSnake.prototype} */
extend(game.ServerSnake.prototype, game.Snake.prototype);
extend(game.ServerSnake.prototype, /** @lends {game.ServerSnake.prototype} */ {

    destruct() {
        this.level = null;
    },

    /**
     * @return {Array}
     */
    serialize() {
        return [this.index, this.direction, this.parts];
    },

    /**
     * @param {number} tick
     * @param {number} elapsed
     * @param shift
     * @param {Array.<room.Player>} players
     */
    handleNextMove(tick, elapsed, shift, players) {
        this.elapsed += elapsed;

        if (!this.crashed && this.elapsed >= this.speed) {
            var move = new SnakeMove(
                this, players, this.level, this.getNextPosition()
            );

            this.elapsed -= this.speed;

            if (!move.collision) {
                this.collision = null;
                this.move(move.location);
            } else if (!this.collision) {
                this.collision = move.collision;
                this.collision.tick = tick;
            }
        }
    },

    /**
     * @return {Coordinate}
     */
    getNextPosition() {
        var shift, head = this.getHead();
        shift = GAME_SHIFT_MAP[this.direction];
        return [head[0] + shift[0], head[1] + shift[1]];
    },

    /**
     * @param {number} tick
     * @return {boolean}
     */
    hasCollisionLteTick(tick) {
        return !this.crashed && this.collision && this.collision.tick <= tick;
    }

});
