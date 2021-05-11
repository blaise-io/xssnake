import { RoundLevelMessage } from "../../shared/room/roundMessages";
import { ROOM_STATUS } from "../../shared/const";
import { PlayersMessage } from "../../shared/room/playerRegistry";
import {
    RoomJoinErrorMessage,
    RoomKeyMessage,
    RoomOptionsMessage,
} from "../../shared/room/roomMessages";
import { RoomOptions } from "../../shared/room/roomOptions";
import { _, noop } from "../../shared/util";
import { EV_PLAYERS_UPDATED, HASH, NS } from "../const";
import { State } from "../state";
import { clearHash, setHash } from "../util/url";
import { ClientPlayerRegistry } from "./clientPlayerRegistry";
import { ClientRoundSet } from "./clientRoundSet";
import { ClientSocketPlayer } from "./clientSocketPlayer";
import { MessageBox } from "./messageBox";
import { Scoreboard } from "./scoreboard";

const COPY_ERROR = Object.fromEntries([
    [ROOM_STATUS.INVALID_KEY, _("Invalid room key")],
    [ROOM_STATUS.NOT_FOUND, _("Room not found")],
    [ROOM_STATUS.FULL, _("The room is full")],
    [ROOM_STATUS.IN_PROGRESS, _("Game in progress")],
    [ROOM_STATUS.UNKNOWN_ERROR, _("Unknown errooshiii#^%^")],
]);

export class ClientRoom {
    key?: string;
    players?: ClientPlayerRegistry; // TODO: move fetching to controller
    options?: RoomOptions; // TODO: move fetching to controller

    private levelIndex?: number;
    private roundSet?: ClientRoundSet;
    private messageBox?: MessageBox;
    private scoreboard?: Scoreboard;

    constructor(
        private clientPlayer: ClientSocketPlayer,
        private resolve: (clientRoom: ClientRoom) => void,
        private reject: (error: string) => void = noop,
    ) {
        this.clientPlayer.send(new RoomOptionsMessage(State.flow.data.roomOptions));
        this.bindEvents();
    }

    destruct(): void {
        clearHash();
        this.unbindEvents();
        // delete this.key;
        // delete this.options;
        this.players?.destruct();
        this.roundSet?.destruct();
        this.messageBox?.destruct();
        this.scoreboard?.destruct();
    }

    bindEvents(): void {
        State.events.on(RoomJoinErrorMessage.id, NS.ROOM, (message: RoomJoinErrorMessage) => {
            this.reject(COPY_ERROR[message.status]);
        });

        State.events.on(RoomOptionsMessage.id, NS.ROOM, (message: RoomOptionsMessage) => {
            this.options = message.options;
            this.checkDataReceived();
        });

        State.events.on(RoomKeyMessage.id, NS.ROOM, (message: RoomKeyMessage) => {
            this.key = message.key;
            setHash(HASH.ROOM, this.key);
            this.checkDataReceived();
        });

        State.events.on(PlayersMessage.id, NS.ROOM, (message: PlayersMessage) => {
            this.players = ClientPlayerRegistry.fromPlayerRegistry(
                this.clientPlayer,
                message.players,
            );
            this.scoreboard = new Scoreboard(this.players);
            this.messageBox = new MessageBox(this.players);
            this.checkDataReceived();

            // TODO: Bind to netcode event instead?
            State.events.trigger(EV_PLAYERS_UPDATED, this.players);
        });

        State.events.on(RoundLevelMessage.id, NS.ROUND_SET, (message: RoundLevelMessage) => {
            this.levelIndex = message.levelIndex;
            this.checkDataReceived();
        });

        // TODO: Create notifier netcode and listen in MessageBox
        // State.events.on(SnakeCrashMessage.id, NS.ROOM, (message: SnakeCrashMessage) => {
        //     this.notifySnakesCrashed(message);
        // });

        //State.events.on(NC_XSS, NS.ROOM, this._requestXss.bind(this));
        //State.events.on(NC_XSS, NS.ROOM, this._evalXss.bind(this));
    }

    unbindEvents(): void {
        State.events.off(RoomJoinErrorMessage.id, NS.ROOM);
        State.events.off(RoomOptionsMessage.id, NS.ROOM);
        State.events.off(RoomKeyMessage.id, NS.ROOM);
        State.events.off(PlayersMessage.id, NS.ROOM);
    }

    get allDataReceived(): boolean {
        return (
            this.key !== undefined &&
            this.options !== undefined &&
            this.players !== undefined &&
            this.levelIndex !== undefined
        );
    }

    checkDataReceived(): void {
        if (
            this.options !== undefined &&
            this.players !== undefined &&
            this.levelIndex !== undefined
        ) {
            this.roundSet = new ClientRoundSet(this.players, this.options, this.levelIndex);
        }

        if (this.allDataReceived) {
            this.resolve(this);
        }
    }

    // setRoom(serializedRoom: [string]): void {
    //     this.key = serializedRoom[0];
    //     this.checkAllRoomDataReceived();
    // }

    // updateOptions(serializedOptions: [number, number, number, number, number, number]): void {
    //     this.options.deserialize(serializedOptions);
    //     this.checkAllRoomDataReceived();
    // }

    // updatePlayers(serializedPlayers: [string, number][]): void {
    //     if (this.roundSet.round && this.roundSet.round.isMidGame()) {
    //         this.players.deserialize(serializedPlayers);
    //     } else {
    //         this.players.reconstruct(serializedPlayers);
    //     }
    //     this.checkAllRoomDataReceived();
    //     State.events.trigger(EV_PLAYERS_UPDATED, this.players);
    // }

    // notifySnakesCrashed(message: SnakeCrashMessage): void {
    //     const colissions = message.colissions;
    //     let notification = "";
    //     const names = this.players.getNames();
    //     for (let i = 0, m = colissions.length; i < m; i++) {
    //         notification += names[colissions[i].playerIndex];

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
