/**
 * @constructor
 * @param {room.ClientPlayerRegistry} players
 * @param {room.Options} options
 * @extends {room.Round}
 */
export class ClientRound {
    constructor(players, options) {
    room.Round.call(this, players, options);
    this.players = players;
    this.level = new levels.BlankLevel(new levelset.Config());
    this.game = new ClientGame(this.level, this.players);

    this.preGameUI = new ui.PreGame(players, options);
    /** @type {ui.WrapupGame} */
    this.wrapupGameUI = null;

    this.bindEvents();
};

extend(room.ClientRound.prototype, room.Round.prototype);
extend(room.ClientRound.prototype, /** @lends {room.ClientRound.prototype} */ {

    destruct() {
        this.unbindEvents();
        this.game.destruct();
        this.game = null;
        if (this.preGameUI) {
            this.preGameUI.destruct();
            this.preGameUI = null;
        }
        if (this.wrapupGameUI) {
            this.wrapupGameUI.destruct();
            this.wrapupGameUI = null;
        }
    }    bindEvents() {
        State.events.on(EV_PLAYERS_UPDATED, NS_ROUND, this.updatePlayers.bind(this));
        State.events.on(NC_ROUND_SERIALIZE, NS_ROUND, this.updateRound.bind(this));
        State.events.on(NC_ROUND_COUNTDOWN, NS_ROUND, this.updateCountdown.bind(this));
        State.events.on(NC_ROUND_START, NS_ROUND, this.startGame.bind(this));
        State.events.on(NC_ROUND_WRAPUP, NS_ROUND, this.wrapupGame.bind(this));
    }    unbindEvents() {
        State.events.off(EV_PLAYERS_UPDATED, NS_ROUND);
        State.events.off(NC_ROUND_SERIALIZE, NS_ROUND);
        State.events.off(NC_ROUND_COUNTDOWN, NS_ROUND);
        State.events.off(NC_ROUND_START, NS_ROUND);
    }    updatePlayers() {
        this.game.updatePlayers(this.players);
        this.preGameUI.updateUI();
    }    updateRound(serializedRound) {
        this.deserialize(serializedRound);
        this.level = this.getLevel(this.levelsetIndex, this.levelIndex);
        this.game.updateLevel(this.level);
    }    updateCountdown(serializedStarted) {
        this.preGameUI.toggleCountdown(Boolean(serializedStarted[0]));
        this.preGameUI.updateUI();
    }    startGame() {
        this.unbindEvents();
        this.preGameUI.destruct();
        this.game.start();
    }    wrapupGame(winnerIndex) {
        this.wrapupGameUI = new ui.WrapupGame(
            this.players,
            this.players.players[winnerIndex] || null
        );
    }

    /**
     * @return {boolean}
     */
    isMidgame() {
        return this.game.started;
    }

});
