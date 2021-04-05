/**
 * @constructor
 * @extends {room.PlayerRegistry}
 */
export class ServerPlayerRegistry {
    constructor(ServerPlayerRegistry) {
    room.PlayerRegistry.call(this);
    this.averageLatencyInTicks = 0;
};

extend(room.ServerPlayerRegistry.prototype, room.PlayerRegistry.prototype);
extend(room.ServerPlayerRegistry.prototype, /** @lends {room.ServerPlayerRegistry.prototype} */ {

    /**
     * Send data to everyone in the room.
     * @param {number} type
     * @param {*=} data
     * @param {room.ServerPlayer=} exclude
     */
    emit(type, data, exclude): void {
        for (var i = 0, m = this.players.length; i < m; i++) {
            if (exclude !== this.players[i]) {
                this.players[i].emit(type, data);
            }
        }
    }

    /**
     * Emit players.
     * Players get their own version because serialize contains local flag.
     */
    emitPlayers() {
        for (var i = 0, m = this.players.length; i < m; i++) {
            this.players[i].emit(
                NC_PLAYERS_SERIALIZE,
                this.serialize(this.players[i])
            );
        }
    }

    removeDisconnectedPlayers() {
        for (var i = 0; i < this.players.length; i++) {
            if (!this.players[i].connected) {
                this.players[i].destruct();
                this.remove(this.players[i]);
                this.emitPlayers();
            }
        }
    }

    /**
     * @param {level.Level} level
     */
    setSnakes(level): void {
        for (var i = 0, m = this.players.length; i < m; i++) {
            this.players[i].setSnake(i, level);
        }
    }

    /**
     * @param {number} tick
     * @return {Array.<room.ServerPlayer>}
     */
    getCollisionsOnTick(tick): void {
        var crashingPlayers = [];
        for (var i = 0, m = this.players.length; i < m; i++) {
            if (this.players[i].snake.hasCollisionLteTick(tick)) {
                crashingPlayers.push(this.players[i]);
            }
        }
        return crashingPlayers;
    }

    /**
     * @param {number} tick
     * @param {number} elapsed
     * @param {Shift} shift
     */
    moveSnakes(tick, elapsed, shift): void {
        for (var i = 0, m = this.players.length; i < m; i++) {
            this.players[i].snake.handleNextMove(tick, elapsed, shift, this.players);
            this.players[i].snake.shiftParts(shift);
        }
    }

});
