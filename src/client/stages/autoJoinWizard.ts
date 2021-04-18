import {
    NC_OPTIONS_SERIALIZE,
    NC_PLAYERS_SERIALIZE,
    NC_ROOM_JOIN_ERROR,
    NC_ROOM_SERIALIZE,
    NC_ROOM_STATUS,
} from "../../shared/const";
import { NS_STAGES } from "../const";
import {
    COPY_AUTOJOIN_CONNECTING,
    COPY_AUTOJOIN_FETCHING,
    COPY_AUTOJOIN_HEADER,
    COPY_ERROR,
} from "../copy/copy";
import { ClientRoom } from "../room/clientRoom";
import { ClientSocketPlayer } from "../room/clientSocketPlayer";
import { ClientState } from "../state/clientState";
import { Dialog } from "../ui/dialog";
import { error } from "../util/clientUtil";
import { AutoJoinStage } from "./autoJoin";

export class AutoJoinWizard {
    dialog: Dialog;
    eventsReceived: number;

    constructor(public roomKey: string) {
        this.dialog = this.getInitialDialog();
        this.autoJoinRoom();
    }

    getInitialDialog() {
        return new Dialog(COPY_AUTOJOIN_HEADER, COPY_AUTOJOIN_CONNECTING);
    }

    autoJoinRoom() {
        ClientState.player = new ClientSocketPlayer(this.onconnect.bind(this));
    }

    onconnect() {
        window.setTimeout(
            function () {
                this.dialog.setBody(COPY_AUTOJOIN_FETCHING);
                window.setTimeout(this.getAutoJoinRoomStatus.bind(this), 500);
            }.bind(this),
            500
        );

        this.bindEvents();
    }

    getAutoJoinRoomStatus() {
        ClientState.player.emit(NC_ROOM_STATUS, [this.roomKey]);
    }

    bindEvents() {
        // Use room to store data until player confirms join.
        ClientState.player.room = new ClientRoom();
        this.eventsReceived = 0;

        ClientState.events.on(
            NC_ROOM_SERIALIZE,
            NS_STAGES,
            this.checkAllRoomDataReceived.bind(this)
        );

        ClientState.events.on(
            NC_OPTIONS_SERIALIZE,
            NS_STAGES,
            this.checkAllRoomDataReceived.bind(this)
        );

        ClientState.events.on(
            NC_PLAYERS_SERIALIZE,
            NS_STAGES,
            this.checkAllRoomDataReceived.bind(this)
        );

        ClientState.events.on(NC_ROOM_JOIN_ERROR, NS_STAGES, this.handleError.bind(this));
    }

    unbindEvents() {
        ClientState.events.off(NC_ROOM_SERIALIZE, NS_STAGES);
        ClientState.events.off(NC_OPTIONS_SERIALIZE, NS_STAGES);
        ClientState.events.off(NC_PLAYERS_SERIALIZE, NS_STAGES);
        ClientState.events.off(NC_ROOM_JOIN_ERROR, NS_STAGES);
    }

    checkAllRoomDataReceived() {
        // Need room, room options and room players.
        if (++this.eventsReceived === 3) {
            this.dialog.destruct();
            this.unbindEvents();
            ClientState.flow.switchStage(AutoJoinStage);
        }
    }

    handleError(data) {
        this.dialog.destruct();
        this.unbindEvents();
        error(COPY_ERROR[data[0]]);
        ClientState.player = null;
    }
}
