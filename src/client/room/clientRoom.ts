import {
    NC_OPTIONS_SERIALIZE,
    NC_PLAYERS_SERIALIZE,
    NC_ROOM_SERIALIZE,
    NC_SNAKE_CRASH,
    ROOM_STATUS,
} from "../../shared/const";
import { NETCODE } from "../../shared/room/netcode";
import { JoinRoomErrorMessage, RoomPlayersMessage } from "../../shared/room/playerRegistry";
import { RoomKeyMessage, RoomOptions, RoomOptionsMessage } from "../../shared/room/roomOptions";
import { _ } from "../../shared/util";
import { HASH, NS } from "../const";
import { State } from "../state";
import { urlHash } from "../util/clientUtil";
import { ClientPlayer } from "./clientPlayer";
import { ClientPlayerRegistry } from "./clientPlayerRegistry";
import { ClientRoundSet } from "./clientRoundSet";
import { MessageBox } from "./messageBox";
import { Scoreboard } from "./scoreboard";

const COPY_ERROR = {
    [ROOM_STATUS.INVALID_KEY]: _("Invalid room key"),
    [ROOM_STATUS.NOT_FOUND]: _("Room not found"),
    [ROOM_STATUS.FULL]: _("The room is full"),
    [ROOM_STATUS.IN_PROGRESS]: _("Game in progress"),
    [ROOM_STATUS.UNKNOWN_ERROR]: _("Unknown errooshiii#^%^"),
};

export class ClientRoom {
    key: string;
    players: ClientPlayerRegistry;
    options: RoomOptions;

    private roundSet: ClientRoundSet;
    private messageBox: MessageBox;
    private scoreboard: Scoreboard;

    constructor(
        clientPlayer: ClientPlayer, // TODO: Not used?
        private resolve: (clientRoom: ClientRoom) => void,
        private reject: (error: string) => void,
    ) {
        this.bindEvents();
    }

    destruct(): void {
        urlHash();
        this.unbindEvents();
        delete this.key;
        delete this.options;
        if (this.players) {
            this.players.destruct();
        }
        if (this.roundSet) {
            this.roundSet.destruct();
        }
        if (this.messageBox) {
            this.messageBox.destruct();
        }
        if (this.scoreboard) {
            this.scoreboard.destruct();
        }
    }

    bindEvents(): void {
        // State.events.on(NC_ROOM_SERIALIZE, NS.ROOM, (data) => {
        //     this.setRoom(data);
        // });

        State.events.on(NETCODE.ROOM_KEY, NS.ROOM, (message: RoomKeyMessage) => {
            this.key = message.key;
            urlHash(HASH.ROOM, this.key);
            this.checkAllRoomDataReceived();
        });

        // State.events.on(NC_OPTIONS_SERIALIZE, NS.ROOM, (data) => {
        //     this.updateOptions(data);
        // });
        State.events.on(NETCODE.ROOM_JOIN_MATCHING, NS.ROOM, (message: RoomOptionsMessage) => {
            this.options = message.options;
            this.checkAllRoomDataReceived();
        });

        // State.events.on(NC_PLAYERS_SERIALIZE, NS.ROOM, (data) => {
        //     this.updatePlayers(data);
        // });

        State.events.on(NETCODE.ROOM_PLAYERS, NS.ROOM, (message: RoomPlayersMessage) => {
            this.players = ClientPlayerRegistry.fromPlayerRegistry(message.players);
            this.checkAllRoomDataReceived();
            // State.events.trigger(EV_PLAYERS_UPDATED, this.players);
        });

        // State.events.on(NC_ROOM_JOIN_ERROR, NS.ROOM, (data) => {
        //     this.handleError(data);
        // });

        State.events.on(NETCODE.ROOM_JOIN_ERROR, NS.ROOM, (message: JoinRoomErrorMessage) => {
            this.reject(COPY_ERROR[message.status].toUpperCase());
        });

        // TODO: Move to a new notifier class
        State.events.on(NC_SNAKE_CRASH, NS.ROOM, this.ncNotifySnakesCrashed.bind(this));

        //State.events.on(NC_XSS, NS.ROOM, this._requestXss.bind(this));
        //State.events.on(NC_XSS, NS.ROOM, this._evalXss.bind(this));
    }

    unbindEvents(): void {
        State.events.off(NC_ROOM_SERIALIZE, NS.ROOM);
        State.events.off(NC_OPTIONS_SERIALIZE, NS.ROOM);
        State.events.off(NC_PLAYERS_SERIALIZE, NS.ROOM);

        State.events.off(NETCODE.ROOM_KEY, NS.ROOM);
        State.events.off(NETCODE.ROOM_JOIN_MATCHING, NS.ROOM);
        State.events.off(NETCODE.ROOM_JOIN_ERROR, NS.ROOM);
    }

    setupComponents(): void {
        this.roundSet = new ClientRoundSet(this.players, this.options);
        this.scoreboard = new Scoreboard(this.players);
        this.messageBox = new MessageBox(this.players);
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
    //     if (this.roundSet.round && this.roundSet.round.isMidgame()) {
    //         this.players.deserialize(serializedPlayers);
    //     } else {
    //         this.players.reconstruct(serializedPlayers);
    //     }
    //     this.checkAllRoomDataReceived();
    //     State.events.trigger(EV_PLAYERS_UPDATED, this.players);
    // }

    get allDataReceived(): boolean {
        return Boolean(this.key && this.options && this.players);
    }

    checkAllRoomDataReceived(): void {
        if (this.allDataReceived) {
            this.resolve(this);
        }
    }
    ncNotifySnakesCrashed(serializedCollisions: any[]): void {
        let notification = "";
        const names = this.players.getNames();
        for (let i = 0, m = serializedCollisions.length; i < m; i++) {
            notification += names[serializedCollisions[i][0]];

            if (i + 1 === m) {
                notification += " crashed.";
            } else if (i + 2 === m) {
                notification += " & ";
            } else {
                notification += ", ";
            }

            if (1 === i % 2 || m === i + 1) {
                // Line end.
                if (i + 1 < m) {
                    // Continuing.
                    notification += "…";
                }
                this.messageBox.addNotification(notification);
                notification = "";
            }
        }
        this.messageBox.ui.debounceUpdate();
    }

    // handleError(data: number[]): void {
    //     this.reject(COPY_ERROR[data[0]].toUpperCase());
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
