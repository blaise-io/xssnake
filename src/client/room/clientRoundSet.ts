import { RoomOptions } from "../../shared/room/roomOptions";
import { RoundMessage } from "../../shared/room/roundMessages";
import { NS } from "../const";
import { State } from "../state";
import { ClientPlayerRegistry } from "./clientPlayerRegistry";
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
        State.events.on(RoundMessage.id, NS.ROUND_SET, async (message: RoundMessage) => {
            // Switch level between rounds.
            // TODO: MessageId.ROUND_SWITCH?
            if (this.round.game && this.round.game.started) {
                this.round.destruct();
                this.round = new ClientRound(this.players, this.options);
                await this.round.setLevel(message.levelSetIndex, message.levelIndex);
            }
        });
    }

    unbindEvents(): void {
        State.events.off(RoundMessage.id, NS.ROUND_SET);
    }
}
