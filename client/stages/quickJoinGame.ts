import {
    NC_PLAYER_NAME, NC_PLAYERS_SERIALIZE, NC_ROOM_JOIN_ERROR, NC_ROOM_JOIN_KEY,
} from "../../shared/const";
import { NS_STAGES } from "../const";
import { COPY_ERROR } from "../copy/copy";
import { Game } from "../stage_base/gameStage";
import { State } from "../state/state";
import { error } from "../util/clientUtil";

export class QuickJoinGame extends Game {

    connectServer() {
        State.player.room.setupComponents();
        State.player.emit(NC_PLAYER_NAME, [this.getPlayerName()]);
        State.player.emit(NC_ROOM_JOIN_KEY, [State.player.room.key]);
        this.bindEvents();
    }

    bindEvents() {
        State.events.on(
            NC_PLAYERS_SERIALIZE,
            NS_STAGES,
            this.setupRoom.bind(this)
        );

        State.events.on(
            NC_ROOM_JOIN_ERROR,
            NS_STAGES,
            this.handleError.bind(this)
        );
    }

    unbindEvents() {
        State.events.off(NC_PLAYERS_SERIALIZE, NS_STAGES);
        State.events.off(NC_ROOM_JOIN_ERROR, NS_STAGES);
    }

    setupRoom() {
        this.destructStageLeftovers();
        this.unbindEvents();
    }

    handleError(data) {
        this.unbindEvents();
        error(COPY_ERROR[data[0]]);
        State.player = null;
    }

}
