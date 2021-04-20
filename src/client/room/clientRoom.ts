import {
    NC_OPTIONS_SERIALIZE,
    NC_PLAYERS_SERIALIZE,
    NC_ROOM_SERIALIZE,
    NC_SNAKE_CRASH,
} from "../../shared/const";
import { EV_PLAYERS_UPDATED, HASH_ROOM, NS } from "../const";
import { ClientState } from "../state/clientState";
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

    constructor(clientPlayer: ClientPlayer) {
        this.key = "";

        this.players = new ClientPlayerRegistry(clientPlayer);
        this.options = new ClientOptions();
        this.roundSet = new ClientRoundSet(this.players, this.options);

        this.messageBox = null;
        this.scoreboard = null;

        this.bindEvents();
    }

    destruct() {
        urlHash();
        this.unbindEvents();
        this.players.destruct();
        this.options.destruct();
        this.roundSet.destruct();
        this.messageBox.destruct();
        this.scoreboard.destruct();
    }

    bindEvents() {
        ClientState.events.on(NC_ROOM_SERIALIZE, NS.ROOM, this.setRoom.bind(this));
        ClientState.events.on(NC_OPTIONS_SERIALIZE, NS.ROOM, this.updateOptions.bind(this));
        ClientState.events.on(NC_PLAYERS_SERIALIZE, NS.ROOM, this.updatePlayers.bind(this));

        // TODO: Move to a new notifier class
        ClientState.events.on(NC_SNAKE_CRASH, NS.ROOM, this.ncNotifySnakesCrashed.bind(this));

        //State.events.on(NC_XSS, NS.ROOM, this._requestXss.bind(this));
        //State.events.on(NC_XSS, NS.ROOM, this._evalXss.bind(this));
    }

    unbindEvents() {
        ClientState.events.off(NC_ROOM_SERIALIZE, NS.ROOM);
        ClientState.events.off(NC_OPTIONS_SERIALIZE, NS.ROOM);
        ClientState.events.off(NC_PLAYERS_SERIALIZE, NS.ROOM);
    }

    setupComponents() {
        this.roundSet.setupRound();
        this.scoreboard = new Scoreboard(this.players);
        this.messageBox = new MessageBox(this.players);
    }

    setRoom(serializedRoom) {
        this.key = serializedRoom[0];
        urlHash(HASH_ROOM, this.key);
    }

    updateOptions(serializedOptions) {
        this.options.deserialize(serializedOptions);
    }

    updatePlayers(serializedPlayers) {
        if (this.roundSet.round && this.roundSet.round.isMidgame()) {
            this.players.deserialize(serializedPlayers);
        } else {
            this.players.reconstruct(serializedPlayers);
        }
        ClientState.events.trigger(EV_PLAYERS_UPDATED, this.players);
    }

    ncNotifySnakesCrashed(serializedCollisions) {
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
