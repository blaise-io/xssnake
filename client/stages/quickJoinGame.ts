import {
    NC_PLAYER_NAME,
    NC_PLAYERS_SERIALIZE,
    NC_ROOM_JOIN_ERROR,
    NC_ROOM_JOIN_KEY,
} from "../../shared/const";
import { NS_STAGES } from "../const";
import { COPY_ERROR } from "../copy/copy";
import { Game } from "../stage_base/gameStage";
import { ClientState } from "../state/clientState";
import { error } from "../util/clientUtil";

export class QuickJoinGame extends Game {
    connectServer() {
        ClientState.player.room.setupComponents();
        ClientState.player.emit(NC_PLAYER_NAME, [this.getPlayerName()]);
        ClientState.player.emit(NC_ROOM_JOIN_KEY, [ClientState.player.room.key]);
        this.bindEvents();
    }

    bindEvents() {
        ClientState.events.on(NC_PLAYERS_SERIALIZE, NS_STAGES, this.setupRoom.bind(this));

        ClientState.events.on(NC_ROOM_JOIN_ERROR, NS_STAGES, this.handleError.bind(this));
    }

    unbindEvents() {
        ClientState.events.off(NC_PLAYERS_SERIALIZE, NS_STAGES);
        ClientState.events.off(NC_ROOM_JOIN_ERROR, NS_STAGES);
    }

    setupRoom() {
        this.destructStageLeftovers();
        this.unbindEvents();
    }

    handleError(data) {
        this.unbindEvents();
        error(COPY_ERROR[data[0]]);
        ClientState.player = null;
    }
}
