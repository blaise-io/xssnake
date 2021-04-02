/**
 * @param {room.ClientPlayerRegistry} players
 * @param {room.ClientOptions} options
 * @constructor
 */
export class ClientRoundSet {
    constructor(players, options) {
    this.players = players;
    this.options = options;
    /** @typedef {room.ClientRound} */
    this.round = null;
    this.bindEvents();
};



    destruct() {
        this.players = null;
        this.options = null;
        this.round.destruct();
        this.round = null;
    }    bindEvents() {
        State.events.on(NC_ROUND_SERIALIZE, NS_ROUND_SET, this.updateRound.bind(this));
    }    unbindEvents() {
        State.events.off(NC_ROUND_SERIALIZE, NS_ROUND_SET);
    }    setupRound() {
        this.round = new ClientRound(this.players, this.options);
    }    updateRound(serializedRound) {
        if (this.round.isMidgame()) {
            this.round.destruct();
            this.round = new ClientRound(this.players, this.options);
            this.round.updateRound(serializedRound);
        }
    }

};
