import { PlayersMessage } from "../../shared/room/playerRegistry";
import {
    RoomGetStatusMessage,
    RoomJoinErrorMessage,
    RoomOptionsClientMessage,
} from "../../shared/room/roomMessages";
import { _ } from "../../shared/util";
import { eventx } from "../netcode/eventHandler";
import { COPY_ERROR } from "../room/clientRoom";
import { ClientSocketPlayer } from "../room/clientSocketPlayer";
import { State } from "../state";
import { Dialog } from "./dialog";

export class AutoJoinDialog {
    private clientSocketPlayer: ClientSocketPlayer;
    private dialog: Dialog;
    private eventContext = eventx.context;

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
                this.eventContext.on(PlayersMessage.id, resolve);
            }),
            new Promise((resolve) => {
                this.eventContext.on(RoomOptionsClientMessage.id, resolve);
            }),
        ]).then((messages) => {
            this.destruct();
            this.resolve(messages);
        });

        this.eventContext.on(RoomJoinErrorMessage.id, (message: RoomJoinErrorMessage) => {
            this.reject(COPY_ERROR[message.status]);
        });
    }

    destruct(): void {
        this.dialog.destruct();
        this.eventContext.destruct();
    }
}
