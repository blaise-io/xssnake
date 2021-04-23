import { NC_PLAYERS_SERIALIZE, NC_ROOM_JOIN_ERROR, NC_ROOM_JOIN_KEY } from "../../shared/const";
import { NS } from "../const";
import { COPY_ERROR } from "../copy/copy";
import { ClientSocketPlayer } from "../room/clientSocketPlayer";
import { GameStage } from "./base/gameStage";
import { State } from "../state";
import { error } from "../util/clientUtil";

export class QuickJoinGame extends GameStage {
    connectServer(): void {
        const room_key = null; // TODO: See AutoJoinWizard.bindEvents
        const clientPlayer = new ClientSocketPlayer(() => {
            clientPlayer.room.setupComponents();
            clientPlayer.emit(NC_ROOM_JOIN_KEY, [room_key]);
            this.destructStageLeftovers();
        });
    }

    bindEvents(): void {
        State.events.on(NC_PLAYERS_SERIALIZE, NS.STAGES, this.setupRoom.bind(this));
        State.events.on(NC_ROOM_JOIN_ERROR, NS.STAGES, this.handleError.bind(this));
    }

    unbindEvents(): void {
        State.events.off(NC_PLAYERS_SERIALIZE, NS.STAGES);
        State.events.off(NC_ROOM_JOIN_ERROR, NS.STAGES);
    }

    setupRoom(): void {
        this.destructStageLeftovers();
        this.unbindEvents();
    }

    handleError(data: [string]): void {
        this.unbindEvents();
        error(COPY_ERROR[data[0]]);
    }
}
