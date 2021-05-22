import { RoomOptions } from "../../shared/room/roomOptions";
import { RoundLevelMessage } from "../../shared/room/roundMessages";
import { EventHandler } from "../netcode/eventHandler";
import { ClientPlayerRegistry } from "./clientPlayerRegistry";
import { ClientRound } from "./clientRound";

export class ClientRoundSet {
    private eventHandler = new EventHandler();
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
        this.eventHandler.destruct();
    }

    bindEvents(): void {
        // Switch level between rounds.
        this.eventHandler.on(RoundLevelMessage.id, async (message: RoundLevelMessage) => {
            if (this.round.game && this.round.game.started) {
                this.round.destruct();
                this.round = new ClientRound(this.players, this.options, this.levelIndex);
                await this.round.setLevel(message.levelIndex);
            }
        });
    }
}
