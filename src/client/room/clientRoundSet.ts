import { RoomOptions } from "../../shared/room/roomOptions";
import { RoundLevelMessage } from "../../shared/room/roundMessages";
import { NS } from "../const";
import { State } from "../state";
import { ClientPlayerRegistry } from "./clientPlayerRegistry";
import { ClientRound } from "./clientRound";

export class ClientRoundSet {
    round: ClientRound = new ClientRound(this.players, this.options, this.levelIndex);

    constructor(
        public players: ClientPlayerRegistry,
        public options: RoomOptions,
        private levelIndex: number,
    ) {
        this.bindEvents();
    }

    destruct(): void {
        this.round.destruct();
        this.unbindEvents();
    }

    bindEvents(): void {
        State.events.on(RoundLevelMessage.id, NS.ROUND_SET, async (message: RoundLevelMessage) => {
            // Switch level between rounds.
            if (this.round.game && this.round.game.started) {
                this.round.destruct();
                this.round = new ClientRound(this.players, this.options, this.levelIndex);
                await this.round.setLevel(message.levelIndex);
            }
        });
    }

    unbindEvents(): void {
        State.events.off(RoundLevelMessage.id, NS.ROUND_SET);
    }
}
