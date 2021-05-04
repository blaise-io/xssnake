import { NC_ROUND_SERIALIZE } from "../../shared/const";
import { RoomOptions } from "../../shared/room/roomOptions";
import { NS } from "../const";
import { State } from "../state";
import { ClientPlayerRegistry } from "./clientPlayerRegistry";
import { ClientRound } from "./clientRound";

export class ClientRoundSet {
    round: ClientRound;

    constructor(public players: ClientPlayerRegistry, public options: RoomOptions) {
        this.players = players;
        this.options = options;
        this.round = undefined;
        this.bindEvents();
    }

    destruct(): void {
        delete this.players;
        delete this.options;
        this.round.destruct();
        delete this.round;
    }

    bindEvents(): void {
        State.events.on(NC_ROUND_SERIALIZE, NS.ROUND_SET, this.updateRound.bind(this));
    }

    unbindEvents(): void {
        State.events.off(NC_ROUND_SERIALIZE, NS.ROUND_SET);
    }

    setupRound(): void {
        this.round = new ClientRound(this.players, this.options);
    }

    updateRound(serializedRound): void {
        if (this.round.isMidgame()) {
            this.round.destruct();
            this.round = new ClientRound(this.players, this.options);
            this.round.updateRound(serializedRound);
        }
    }
}
