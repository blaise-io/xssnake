import { ROOM_STATUS } from "../../shared/const";
import { PlayersMessage } from "../../shared/room/playerRegistry";

import { RoomOptions } from "../../shared/room/roomOptions";
import { _ } from "../../shared/util";
import { HASH } from "../const";
import { State } from "../state";
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
    private ns = "room";

    constructor(
        private key: string,
        public players: ClientPlayerRegistry,
        public options: RoomOptions,
        private levelIndex: number,
    ) {
        this.bindEvents();
        setHash(HASH.ROOM, key);
    }

    destruct(): void {
        clearHash();
        this.unbindEvents();
        this.messageBox?.destruct();
        this.scoreboard?.destruct();
        this.roundSet?.destruct();
    }

    bindEvents(): void {
        State.events.on(PlayersMessage.id, this.ns, (message: PlayersMessage) => {
            this.players.updateFromMessage(message.players);
        });

        //State.events.on(NC_XSS, NS.ROOM, this._requestXss.bind(this));
        //State.events.on(NC_XSS, NS.ROOM, this._evalXss.bind(this));
    }

    unbindEvents(): void {
        State.events.off(PlayersMessage.id, this.ns);
    }

    // notifySnakesCrashed(message: SnakeCrashMessage): void {
    //     const collisions = message.collisions;
    //     let notification = "";
    //     const names = this.players.getNames();
    //     for (let i = 0, m = collisions.length; i < m; i++) {
    //         notification += names[collisions[i].playerIndex];

    //         if (i + 1 === m) {
    //             notification += " crashed.";
    //         } else if (i + 2 === m) {
    //             notification += " & ";
    //         } else {
    //             notification += ", ";
    //         }

    //         if (1 === i % 2 || m === i + 1) {
    //             // Line end.
    //             if (i + 1 < m) {
    //                 // Continuing.
    //                 notification += "…";
    //             }
    //             this.messageBox?.addNotification(notification);
    //             notification = "";
    //         }
    //     }
    //     this.messageBox?.ui.debounceUpdate();
    // }

    //    /**
    //     * @param {Array.<string>} names
    //     * @return {Array.<string>}
    //     * @private
    //     */
    //    _sanitizeNames(names) {
    //        for (let i = 0, m = names.length; i < m; i++) {
    //            while (fontWidth(names[i]) > UI_WIDTH_NAME) {
    //                names[i] = names[i].slice(0, -1);
    //            }
    //        }
    //        return names;
    //    }
}
