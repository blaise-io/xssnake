import { NC_ROUND_SERIALIZE } from "../../shared/const";
import { NS_ROUND_SET } from "../const";
import { ClientState } from "../state/clientState";
import { ClientPlayerRegistry } from "./clientPlayerRegistry";
import { ClientRound } from "./clientRound";
import { ClientOptions } from "./options";

export class ClientRoundSet {
    round: ClientRound;

    constructor(public players: ClientPlayerRegistry, public options: ClientOptions) {
        this.players = players;
        this.options = options;
        this.round = null;
        this.bindEvents();
    }

    destruct() {
        this.players = null;
        this.options = null;
        this.round.destruct();
        this.round = null;
    }

    bindEvents() {
        ClientState.events.on(NC_ROUND_SERIALIZE, NS_ROUND_SET, this.updateRound.bind(this));
    }

    unbindEvents() {
        ClientState.events.off(NC_ROUND_SERIALIZE, NS_ROUND_SET);
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
