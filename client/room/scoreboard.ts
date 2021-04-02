/**
 * @param {room.ClientPlayerRegistry} players
 * @constructor
 */
export class Scoreboard {
    constructor(players) {
    this.players = players;
    this.ui = new ui.Scoreboard(players);
    this.bindEvents();
};



    destruct() {
        this.players = null;
        this.ui.destruct();
        this.ui = null;
        this.unbindEvents();
    }    bindEvents() {
        State.events.on(
            NC_PLAYERS_SERIALIZE,
            NS_SCORE,
            this.ui.debounceUpdate.bind(this.ui)
        );
        State.events.on(
            NC_SCORE_UPDATE,
            NS_SCORE,
            this.updatePlayerScores.bind(this)
        );
    }    unbindEvents() {
        State.events.off(NC_PLAYERS_SERIALIZE, NS_SCORE);
        State.events.off(NC_SCORE_UPDATE, NS_SCORE);
    }    updatePlayerScores(scoreArray) {
        this.players.setScores(scoreArray);
        this.ui.debounceUpdate();
    }

};
