import {
    NC_OPTIONS_SERIALIZE,
    NC_PLAYERS_SERIALIZE,
    NC_ROOM_JOIN_ERROR,
    NC_ROOM_SERIALIZE,
    NC_ROOM_STATUS,
} from "../../shared/const";
import { _ } from "../../shared/util";
import { NS } from "../const";
import { COPY_ERROR } from "../copy/copy";
import { ClientSocketPlayer } from "../room/clientSocketPlayer";
import { State } from "../state";
import { Dialog } from "../ui/dialog";
import { error } from "../util/clientUtil";
import { AutoJoinStage } from "./autoJoin";

export class AutoJoinWizard {
    clientPlayer: ClientSocketPlayer;
    private dialog: Dialog;
    private messageTimeout: number;
    private dataReceived = {
        room: false,
        options: false,
        players: false,
    };

    constructor(public roomKey: string) {
        this.dialog = new Dialog(_("Auto-Join room").toUpperCase(), _("Connecting to server…"));
        this.clientPlayer = new ClientSocketPlayer(this.onconnect.bind(this));
    }

    destruct(): void {
        window.clearTimeout(this.messageTimeout);
        this.dialog.destruct();
        this.unbindEvents();
    }

    onconnect(): void {
        this.messageTimeout = window.setTimeout(() => {
            this.dialog.body = _("Getting room properties…");
            this.messageTimeout = window.setTimeout(() => {
                this.clientPlayer.emit(NC_ROOM_STATUS, [this.roomKey]);
            }, 500);
        }, 500);

        this.bindEvents();
    }

    bindEvents(): void {
        // Use room to store data until player confirms join.
        // TODO: NO!
        // this.clientPlayer.room = new ClientRoom();

        State.events.on(NC_ROOM_SERIALIZE, NS.STAGES, () => {
            this.dataReceived.room = true;
            this.checkAllRoomDataReceived();
        });

        State.events.on(NC_OPTIONS_SERIALIZE, NS.STAGES, () => {
            this.dataReceived.options = true;
            this.checkAllRoomDataReceived();
        });

        State.events.on(NC_PLAYERS_SERIALIZE, NS.STAGES, () => {
            this.dataReceived.players = true;
            this.checkAllRoomDataReceived();
        });

        State.events.on(NC_ROOM_JOIN_ERROR, NS.STAGES, (data) => {
            this.handleError(data);
        });
    }

    unbindEvents(): void {
        State.events.off(NC_ROOM_SERIALIZE, NS.STAGES);
        State.events.off(NC_OPTIONS_SERIALIZE, NS.STAGES);
        State.events.off(NC_PLAYERS_SERIALIZE, NS.STAGES);
        State.events.off(NC_ROOM_JOIN_ERROR, NS.STAGES);
    }

    get allDataReceived(): boolean {
        return this.dataReceived.room && this.dataReceived.options && this.dataReceived.players;
    }

    checkAllRoomDataReceived(): void {
        if (this.allDataReceived) {
            this.destruct();
            State.flow.switchStage(AutoJoinStage.bind(this.clientPlayer));
        }
    }

    handleError(data: number[]): void {
        error(COPY_ERROR[data[0]]);
        this.destruct();
    }
}
