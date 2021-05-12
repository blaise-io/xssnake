import { ROOM_STATUS } from "../../shared/const";
import { PlayersMessage } from "../../shared/room/playerRegistry";

import { RoomOptions } from "../../shared/room/roomOptions";
import { _ } from "../../shared/util";
import { HASH } from "../const";
import { eventx } from "../netcode/eventHandler";
import { clearHash, setHash } from "../util/url";
import { ClientPlayerRegistry } from "./clientPlayerRegistry";
import { ClientRoundSet } from "./clientRoundSet";
import { MessageBox } from "./messageBox";
import { Scoreboard } from "./scoreboard";

export const COPY_ERROR = Object.fromEntries([
    [ROOM_STATUS.INVALID_KEY, _("Invalid room key")],
    [ROOM_STATUS.NOT_FOUND, _("Room not found")],
    [ROOM_STATUS.FULL, _("The room is full")],
    [ROOM_STATUS.IN_PROGRESS, _("Game in progress")],
    [ROOM_STATUS.UNKNOWN_ERROR, _("Unknown errooshiii#^%^")],
]);

export class ClientRoom {
    private messageBox = new MessageBox(this.players);
    private scoreboard = new Scoreboard(this.players);
    private roundSet = new ClientRoundSet(this.players, this.options, this.levelIndex);
    private eventContext = eventx.context;

    constructor(
        private key: string,
        public players: ClientPlayerRegistry,
        public options: RoomOptions,
        private levelIndex: number,
    ) {
        this.eventContext.on(PlayersMessage.id, (message: PlayersMessage) => {
            this.players.updateFromMessage(message.players);
        });
        setHash(HASH.ROOM, key);
    }

    destruct(): void {
        clearHash();
        this.eventContext.destruct();
        this.messageBox?.destruct();
        this.scoreboard?.destruct();
        this.roundSet?.destruct();
    }
}
