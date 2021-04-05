/**
 * @param {EventEmitter} roomEmitter
 * @param {room.ServerPlayerRegistry} players
 * @param {room.Options} options
 * @param {LevelPlayset} levelPlayset
 * @constructor
 * @extends {room.Round}
 */
export class ServerRound {
    constructor(ServerRound) {
    room.Round.call(this, players, options);
    this.roomEmitter = roomEmitter;
    this.levelsetIndex = options.levelset;
    this.levelset = State.levelsetRegistry.getLevelset(this.levelsetIndex);
    this.levelIndex = levelPlayset.getNext();

    /** @type {game.ServerGame} */
    this.game = null;
    /** @type {level.Level} */
    this.level = null;

    this.countdownStarted = false;
    this.wrappingUp = false;

    this.handleDisconnectBound = this.handleDisconnect.bind(this);

    this.bindEvents();
};

extend(room.ServerRound.prototype, room.Round.prototype);

extend(room.ServerRound.prototype, /** @lends {room.ServerRound.prototype} */ {

    destruct() {
        clearTimeout(this.countdownTimer);
        this.unbindEvents();

        if (this.game) {
            this.game.destruct();
            this.game = null;
        }

        if (this.level) {
            this.level.destruct();
            this.level = null;
        }

        this.handleDisconnectBound = null;
        this.roomEmitter = null;
        this.levelset = null;
    }

    bindEvents() {
        this.roomEmitter.on(SE_PLAYER_DISCONNECT, this.handleDisconnectBound);
        this.roomEmitter.on(NC_ROOM_START, this.handleManualRoomStart.bind(this));
    }

    unbindEvents() {
        this.roomEmitter.removeListener(SE_PLAYER_DISCONNECT, this.handleDisconnectBound);
        this.roomEmitter.removeAllListeners(NC_ROOM_START);
    }

    /**
     * @param {room.ServerPlayer} player
     */
    emit(player): void {
        player.emit(NC_ROUND_SERIALIZE, this.serialize());
    }

    emitAll() {
        this.players.emit(NC_ROUND_SERIALIZE, this.serialize());
    }

    /**
     * @return {number}
     */
    getAlivePlayers() {
        return this.players.filter({snake: {crashed: false}});
    }

    /**
     * @param {room.ServerPlayer} winner
     */
    wrapUp(winner): void {
        var data = [this.players.players.indexOf(winner)];
        this.players.emit(NC_ROUND_WRAPUP, data);
        this.wrappingUp = true;
    }

    /**
     * @param {boolean} enabled
     */
    toggleCountdown(enabled): void {
        clearTimeout(this.countdownTimer);
        this.countdownStarted = enabled;
        this.players.emit(NC_ROUND_COUNTDOWN, [+enabled]);

        if (enabled) {
            this.countdownTimer = setTimeout(
                this.startRound.bind(this),
                SECONDS_ROUND_COUNTDOWN * 1000
            );
        }
    }

    startRound() {
        this.unbindEvents();
        this.level = this.getLevel(this.levelsetIndex, this.levelIndex);
        this.game = new ServerGame(this.roomEmitter, this.level, this.players);
        this.started = true;
        this.players.emit(NC_ROUND_START);
    }

    handleManualRoomStart(nodata, player) {
        if (this.players.isHost(player) && !this.countdownTimer) {
            this.toggleCountdown(true);
        }
    }

    handleDisconnect() {
        if (this.countdownStarted) {
            this.toggleCountdown(false);
        }
    }

});
