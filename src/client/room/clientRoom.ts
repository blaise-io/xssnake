import {
    NC_OPTIONS_SERIALIZE,
    NC_PLAYERS_SERIALIZE,
    NC_ROOM_JOIN_ERROR,
    NC_ROOM_SERIALIZE,
    NC_SNAKE_CRASH,
} from "../../shared/const";
import { EV_PLAYERS_UPDATED, NS } from "../const";
import { COPY_ERROR } from "../copy/copy";
import { State } from "../state";
import { urlHash } from "../util/clientUtil";
import { ClientPlayer } from "./clientPlayer";
import { ClientPlayerRegistry } from "./clientPlayerRegistry";
import { ClientRoundSet } from "./clientRoundSet";
import { MessageBox } from "./messageBox";
import { ClientOptions } from "./options";
import { Scoreboard } from "./scoreboard";

export class ClientRoom {
    key: string;
    players: ClientPlayerRegistry;
    options: ClientOptions;
    private roundSet: ClientRoundSet;
    private messageBox: MessageBox;
    private scoreboard: Scoreboard;
    private dataReceived = {
        room: false,
        options: false,
        players: false,
    };

    constructor(
        clientPlayer: ClientPlayer,
        private resolve: (clientRoom: ClientRoom) => void,
        private reject: (error: string) => void
    ) {
        this.key = "";

        this.players = new ClientPlayerRegistry(clientPlayer);
        this.options = new ClientOptions();
        this.roundSet = new ClientRoundSet(this.players, this.options);

        this.bindEvents();
    }

    destruct(): void {
        urlHash();
        this.unbindEvents();
        this.players.destruct();
        this.options.destruct();
        this.roundSet.destruct();
        this.messageBox.destruct();
        this.scoreboard.destruct();
    }

    bindEvents(): void {
        State.events.on(NC_ROOM_SERIALIZE, NS.ROOM, (data) => {
            this.setRoom(data);
        });
        State.events.on(NC_OPTIONS_SERIALIZE, NS.ROOM, (data) => {
            this.updateOptions(data);
        });
        State.events.on(NC_PLAYERS_SERIALIZE, NS.ROOM, (data) => {
            this.updatePlayers(data);
        });
        State.events.on(NC_ROOM_JOIN_ERROR, NS.ROOM, (data) => {
            this.handleError(data);
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
    }

    setupComponents(): void {
        this.roundSet.setupRound();
        this.scoreboard = new Scoreboard(this.players);
        this.messageBox = new MessageBox(this.players);
    }

    setRoom(serializedRoom: [string]): void {
        this.key = serializedRoom[0];
        this.checkAllRoomDataReceived();
    }

    updateOptions(serializedOptions: [number, number, number, number, number, number]): void {
        this.options.deserialize(serializedOptions);
        this.checkAllRoomDataReceived();
    }

    updatePlayers(serializedPlayers: [string, number][]): void {
        if (this.roundSet.round && this.roundSet.round.isMidgame()) {
            this.players.deserialize(serializedPlayers);
        } else {
            this.players.reconstruct(serializedPlayers);
        }
        this.checkAllRoomDataReceived();
        State.events.trigger(EV_PLAYERS_UPDATED, this.players);
    }

    get allDataReceived(): boolean {
        return this.dataReceived.room && this.dataReceived.options && this.dataReceived.players;
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

    handleError(data: number[]): void {
        this.reject(COPY_ERROR[data[0]]);
    }

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
