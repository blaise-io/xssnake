import { GetRoomStatusServerMessage } from "../../shared/room/roomOptions";
import { _ } from "../../shared/util";
import { ClientRoom } from "../room/clientRoom";
import { ClientSocketPlayer } from "../room/clientSocketPlayer";
import { State } from "../state";
import { Dialog } from "./dialog";

export class AutoJoinDialog {
    private clientPlayer: ClientSocketPlayer;
    private dialog: Dialog;
    private messageTimeout: number;

    constructor(
        public roomKey: string,
        private resolve: (clientRoom: ClientRoom) => void,
        private reject: (error: string) => void,
    ) {
        this.dialog = new Dialog(_("Auto-Join room").toUpperCase(), _("Connecting to server…"));
        this.clientPlayer = new ClientSocketPlayer(State.flow.data.name, this.onconnect.bind(this));

        new ClientRoom(
            this.clientPlayer,
            (room) => {
                this.destruct();
                resolve(room);
            },
            reject,
        );
    }

    destruct(): void {
        window.clearTimeout(this.messageTimeout);
        this.dialog.destruct();
    }

    onconnect(): void {
        this.clientPlayer.send(new GetRoomStatusServerMessage(this.roomKey));
    }
}
