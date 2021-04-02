/***
 * Game
 * @param {EventEmitter} roomEmitter
 * @param {level.Level} level
 * @param {room.ServerPlayerRegistry} players
 * @constructor
 */
export class ServerGame {
    constructor(ServerGame) {
    this.roomEmitter = roomEmitter;
    this.level = level;
    this.players = players;

    this.items = new ServerItems(level, players);
    this.tick = 0;
    this.lastTick = +new Date();
    this.averageLatencyInTicks = 1;

    this.players.setSnakes(this.level);

    this.bindEvents();

    this.tickInterval = setInterval(
        this.handleTick.bind(this),
        SERVER_TICK_INTERVAL
    );
};



    destruct() {
        clearInterval(this.tickInterval);
        this.unbindEvents();

        this.items.destruct();

        this.level = null;
        this.players = null;
        this.items = null;
    },

    bindEvents() {
        this.roomEmitter.on(NC_SNAKE_UPDATE, this.ncSnakeUpdate.bind(this));
        this.roomEmitter.on(NC_PONG, this.ncPong.bind(this));
    },

    unbindEvents() {
        this.roomEmitter.removeAllListeners(NC_SNAKE_UPDATE);
        this.roomEmitter.removeAllListeners(NC_PONG);
    },

    /**
     * @param {?} dirtySnake
     * @param {room.ServerPlayer} player
     */
    ncSnakeUpdate(dirtySnake, player) {
        var move = new ServerSnakeMove(dirtySnake, player);
        if (move.isValid()) {
            this.applyMove(player.snake, move);
            this.players.emit(NC_SNAKE_UPDATE, player.snake.serialize(), player);
        } else {
            this.players.emit(NC_SNAKE_UPDATE, player.snake.serialize());
        }
    },

    /**
     * Update averge latency of all players in this room.
     * Affects tolerance of clients overriding server prediction.
     */
    ncPong() {
        this.averageLatencyInTicks = this.getAverageLatencyInTicks();
    },

    /**
     * @return {number}
     */
    getCrashedCount() {
        var count = 0;
        for (var i = 0, m = this.players.players.length; i < m; i++) {
            if (this.players.players[i].snake.crashed) {
                count++;
            }
        }
        return count;
    },

    /**
     * @return {number}
     */
    getAverageLatencyInTicks() {
        var latencies = [];
        for (var i = 0, m = this.players.length; i < m; i++) {
            latencies.push(this.players[i].player.heartbeat.latency);
        }
        return Math.round(average(latencies) / SERVER_TICK_INTERVAL);
    },

    handleTick() {
        var now = +new Date();
        this.gameloop(++this.tick, now - this.lastTick);
        this.lastTick = now;
    },

    gameloop(tick, elapsed) {
        var shift = this.level.gravity.getShift(elapsed);
        this.level.animations.update(elapsed, this.started);
        this.handleCrashingPlayers(tick - this.averageLatencyInTicks);
        this.players.moveSnakes(tick, elapsed, shift);
    },

    handleCrashingPlayers(tick) {
        var collisions = [], crashingPlayers;

        crashingPlayers = this.players.getCollisionsOnTick(tick);

        if (crashingPlayers.length) {
            for (var i = 0, m = crashingPlayers.length; i < m; i++) {
                var snake = crashingPlayers[i].snake;
                snake.crashed = true;
                collisions.push([
                    snake.index,
                    snake.parts,
                    snake.collision.serialize()
                ]);
            }

            // Emit crashed snakes.
            this.players.emit(NC_SNAKE_CRASH, collisions);

            // Let round manager know.
            this.roomEmitter.emit(SE_PLAYER_COLLISION, crashingPlayers);
        }
    },

    /**
     * @param {game.Snake} snake
     * @param {game.ServerSnakeMove} move
     */
    applyMove(snake, move) {
        snake.direction = move.direction;
        snake.parts = move.parts;
        snake.trimParts();
    }

};
