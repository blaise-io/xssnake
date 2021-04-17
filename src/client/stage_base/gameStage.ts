/**
 * Game Stage
 * @implements {StageInterface}
 * @constructor
 */
import { HEIGHT, NC_PLAYER_NAME, NC_ROOM_JOIN_MATCHING, WIDTH } from "../../shared/const";
import { Shape } from "../../shared/shape";
import { getRandomName } from "../../shared/util";
import { DOM_EVENT_KEYDOWN, NS_STAGES, STORAGE_NAME } from "../const";
import { COPY_CONNECTING } from "../copy/copy";
import { ClientRoom } from "../room/clientRoom";
import { ClientSocketPlayer } from "../room/clientSocketPlayer";
import { ClientOptions } from "../room/options";
import { ClientState } from "../state/clientState";
import { font } from "../ui/font";
import { center, flash, lifetime } from "../ui/shapeClient";
import { storage } from "../util/clientUtil";

export class Game {
    constructor() {}

    getShape() {
        return new Shape();
    }

    getData() {
        return {};
    }

    construct() {
        this.connectServer();
    }

    destruct() {
        if (ClientState.player) {
            if (ClientState.player.room) {
                ClientState.player.room.destruct();
            }
            ClientState.player.destruct();
        }
        ClientState.events.off(DOM_EVENT_KEYDOWN, NS_STAGES);
        ClientState.shapes.CONNECTING = null;
    }

    getSerializedGameOptions() {
        const data = ClientState.flow.getData();
        const options = new ClientOptions();
        options.setOptionsFromForm(data.multiplayer);
        return options.serialize();
    }

    getPlayerName() {
        let name = storage(STORAGE_NAME) as string;
        if (!name) {
            name = getRandomName();
            storage(name, STORAGE_NAME);
        }
        return name;
    }

    getEmitData() {
        return this.getSerializedGameOptions();
    }

    connectServer() {
        ClientState.shapes.CONNECTING = this.getConnectingShape();
        ClientState.player = new ClientSocketPlayer(this.connectRoom.bind(this));
    }

    connectRoom() {
        ClientState.player.room = new ClientRoom();
        ClientState.player.room.setupComponents();
        ClientState.player.emit(NC_PLAYER_NAME, [this.getPlayerName()]);
        ClientState.player.emit(NC_ROOM_JOIN_MATCHING, this.getEmitData());
        this.destructStageLeftovers();
    }

    getConnectingShape() {
        const shape = font(COPY_CONNECTING);
        center(shape, WIDTH, HEIGHT - 20);
        lifetime(shape, 2000);
        flash(shape);
        return shape;
    }

    destructStageLeftovers() {
        if (ClientState.menuSnake) {
            ClientState.menuSnake.destruct();
        }
        ClientState.shapes.CONNECTING = null;
        ClientState.shapes.HEADER = null;
    }
}
