import { NC_ROUND_SERIALIZE } from "../../shared/const";
import { NS } from "../const";
import { State } from "../state";
import { ClientPlayerRegistry } from "./clientPlayerRegistry";
import { ClientRound } from "./clientRound";
import { ClientOptions } from "./options";

export class ClientRoundSet {
    round: ClientRound;

    constructor(public players: ClientPlayerRegistry, public options: ClientOptions) {
        this.players = players;
        this.options = options;
        this.round = undefined;
        this.bindEvents();
    }

    destruct() {
        this.players = undefined;
        this.options = undefined;
        this.round.destruct();
        this.round = undefined;
    }

    bindEvents() {
        State.events.on(NC_ROUND_SERIALIZE, NS.ROUND_SET, this.updateRound.bind(this));
    }

    unbindEvents() {
        State.events.off(NC_ROUND_SERIALIZE, NS.ROUND_SET);
    }

    setupRound() {
        this.round = new ClientRound(this.players, this.options);
    }

    updateRound(serializedRound) {
        if (this.round.isMidgame()) {
            this.round.destruct();
            this.round = new ClientRound(this.players, this.options);
            this.round.updateRound(serializedRound);
        }
    }
}
