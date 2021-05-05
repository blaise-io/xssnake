import { NETCODE } from "../../shared/room/netcode";
import { RoomOptions } from "../../shared/room/roomOptions";
import { RoomRoundMessage } from "../../shared/room/round";
import { NS } from "../const";
import { State } from "../state";
import { ClientRound } from "./clientRound";

export class ClientRoundSet {
    round: ClientRound;

    constructor(public players: ClientPlayerRegistry, public options: RoomOptions) {
        this.round = new ClientRound(this.players, this.options);
        this.bindEvents();
    }

    destruct(): void {
        delete this.players;
        delete this.options;
        this.round.destruct();
        delete this.round;
        this.unbindEvents();
    }

    bindEvents(): void {
        State.events.on(
            NETCODE.ROUND_SERIALIZE,
            NS.ROUND_SET,
            async (message: RoomRoundMessage) => {
                // Switch level between rounds.
                // TODO: NETCODE.ROUND_SWITCH?
                if (this.round.game && this.round.game.started) {
                    this.round.destruct();
                    this.round = new ClientRound(this.players, this.options);
                    await this.round.setLevel(message.levelSetIndex, message.levelIndex);
                }
            },
        );
    }

    unbindEvents(): void {
        State.events.off(NETCODE.ROUND_SERIALIZE, NS.ROUND_SET);
    }
}
