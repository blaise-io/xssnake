import { PlayersMessage } from "../../shared/room/playerRegistry";
import {
    RoomGetStatusMessage,
    RoomJoinErrorMessage,
    RoomOptionsClientMessage,
} from "../../shared/room/roomMessages";
import { _ } from "../../shared/util";
import { COPY_ERROR } from "../room/clientRoom";
import { ClientSocketPlayer } from "../room/clientSocketPlayer";
import { State } from "../state";
import { Dialog } from "./dialog";

export class AutoJoinDialog {
    private clientSocketPlayer: ClientSocketPlayer;
    private dialog: Dialog;
    private ns = "autojoindialog";

    constructor(
        public roomKey: string,
        private resolve: (messages: [PlayersMessage, RoomOptionsClientMessage]) => void,
        private reject: (error: string) => void,
    ) {
        this.dialog = new Dialog(_("Auto-Join room"), _("Connecting to server…"));
        this.clientSocketPlayer = new ClientSocketPlayer(State.flow.data.name, () => {
            this.getRoomDetails();
        });
    }

    getRoomDetails(): void {
        this.clientSocketPlayer.send(new RoomGetStatusMessage(this.roomKey));

        Promise.all<PlayersMessage, RoomOptionsClientMessage>([
            new Promise((resolve) => {
                State.events.on(PlayersMessage.id, this.ns, resolve);
            }),
            new Promise((resolve) => {
                State.events.on(RoomOptionsClientMessage.id, this.ns, resolve);
            }),
        ]).then((messages) => {
            this.destruct();
            this.resolve(messages);
        });

        State.events.on(RoomJoinErrorMessage.id, this.ns, (message: RoomJoinErrorMessage) => {
            this.reject(COPY_ERROR[message.status]);
        });
    }

    destruct(): void {
        this.dialog.destruct();
        State.events.off(PlayersMessage.id, this.ns);
        State.events.off(RoomOptionsClientMessage.id, this.ns);
    }
}
