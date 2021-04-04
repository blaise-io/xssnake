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
import { State } from "../state/state";
import { font } from "../ui/font";
import { center, flash, lifetime } from "../ui/shapeClient";
import { storage } from "../util/clientUtil";

export class Game {

    constructor() {
    }

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
        if (State.player) {
            if (State.player.room) {
                State.player.room.destruct();
            }
            State.player.destruct();
        }
        State.events.off(DOM_EVENT_KEYDOWN, NS_STAGES);
        State.shapes.CONNECTING = null;
    }

    getSerializedGameOptions() {
        const data = State.flow.getData();
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
        State.shapes.CONNECTING = this.getConnectingShape();
        State.player = new ClientSocketPlayer(this.connectRoom.bind(this));
    }

    connectRoom() {
        State.player.room = new ClientRoom();
        State.player.room.setupComponents();
        State.player.emit(NC_PLAYER_NAME, [this.getPlayerName()]);
        State.player.emit(NC_ROOM_JOIN_MATCHING, this.getEmitData());
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
        if (State.menuSnake) {
            State.menuSnake.destruct();
        }
        State.shapes.CONNECTING = null;
        State.shapes.HEADER = null;
    }

}
