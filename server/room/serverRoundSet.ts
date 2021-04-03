/**
 * A set of rounds.
 * After N rounds, the player with most points wins.
 *
 * @param {EventEmitter} roomEmitter
 * @param {room.ServerPlayerRegistry} players
 * @param {room.Options} options
 * @constructor
 */
export class ServerRoundSet {
    constructor(ServerRoundSet) {
        this.roomEmitter = roomEmitter;
        this.players = players;
        this.options = options;

        this.levelPlayset = new LevelPlayset(options.levelset);
        this.round = new ServerRound(roomEmitter, players, options, this.levelPlayset);
        this.score = new ServerScore(players);
        this.roundIndex = 0;

        this.bindEvents();
    }



    destruct() {
        this.roomEmitter.removeAllListeners(SE_PLAYER_COLLISION);
        clearTimeout(this.nextRoundTimeout);

        this.levelPlayset.destruct();
        this.levelPlayset = null;

        this.round.destruct();
        this.round = null;

        this.score.destruct();
        this.score = null;

        this.players = null;
        this.options = null;
    }

    bindEvents() {
        this.roomEmitter.on(SE_PLAYER_COLLISION, this.handleCollisions.bind(this));
    }

    /**
     * @param {room.ServerPlayer} winner
     */
    switchRounds(winner) {
        const delay = winner ? SECONDS_ROUND_GLOAT : SECONDS_ROUND_PAUSE;
        if (this.hasSetWinner()) {
            // TODO
        } else if (!this.round.wrappingUp) {
            this.round.wrapUp(winner);
            this.nextRoundTimeout = setTimeout(
                this.startNewRound.bind(this), delay * 1000
            );
        }
    }

    startNewRound() {
        this.round.destruct();
        this.round = new ServerRound(
            this.roomEmitter, this.players, this.options, this.levelPlayset
        );
        this.round.emitAll();
        this.players.removeDisconnectedPlayers();
        this.round.toggleCountdown(true);
    }

    hasSetWinner() {
        return false;
    }

    handleCollisions(crashingPlayers) {
        const alive = this.round.getAlivePlayers();
        this.score.update(crashingPlayers, this.round.level);
        if (alive.length <= 1) {
            this.switchRounds(alive[0] || null);
        }
    }

    hasStarted() {
        return (this.roundIndex >= 1 || this.round.started);
    }

    detectAutostart(full) {
        if (full && 0 === this.roundIndex) {
            this.round.toggleCountdown(true);
        }
    }

}
