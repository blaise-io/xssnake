import { HEIGHT, NC_PLAYER_NAME, NC_ROOM_JOIN_MATCHING, WIDTH } from "../../../shared/const";
import { Shape } from "../../../shared/shape";
import { getRandomName } from "../../../shared/util";
import { NS, STORAGE_NAME } from "../../const";
import { COPY_CONNECTING } from "../../copy/copy";
import { ClientRoom } from "../../room/clientRoom";
import { ClientSocketPlayer } from "../../room/clientSocketPlayer";
import { ClientOptions } from "../../room/options";
import { State } from "../../state";
import { font } from "../../ui/font";
import { center, flash, lifetime } from "../../ui/shapeClient";
import { storage } from "../../util/clientUtil";
import { StageInterface } from "./stage";

export class GameStage implements StageInterface {
    getShape(): Shape {
        return new Shape();
    }

    getData(): Record<string, unknown> {
        return {};
    }

    construct(): void {
        State.shapes.CONNECTING = this.connectingShape;
        this.connectServer();
    }

    destruct(): void {
        State.events.off("keydown", NS.STAGES);
        State.shapes.CONNECTING = null;
    }

    getSerializedGameOptions(): [number, number, number, number, number, number] {
        const data = State.flow.getData();
        const options = new ClientOptions();
        options.setOptionsFromForm(data.multiplayer);
        return options.serialize();
    }

    getPlayerName(): string {
        let name = storage(STORAGE_NAME) as string;
        if (!name) {
            name = getRandomName();
            storage(name, STORAGE_NAME);
        }
        return name;
    }

    connectServer(): void {
        const clientPlayer = new ClientSocketPlayer(() => {
            clientPlayer.room = new ClientRoom(clientPlayer);
            clientPlayer.room.setupComponents();
            clientPlayer.emit(NC_PLAYER_NAME, [this.getPlayerName()]);
            clientPlayer.emit(NC_ROOM_JOIN_MATCHING, this.getSerializedGameOptions());
            this.destructStageLeftovers();
        });
    }

    get connectingShape(): Shape {
        const shape = font(COPY_CONNECTING);
        center(shape, WIDTH, HEIGHT - 20);
        lifetime(shape, 2000);
        flash(shape);
        return shape;
    }

    destructStageLeftovers(): void {
        if (State.menuSnake) {
            State.menuSnake.destruct();
        }
        State.shapes.CONNECTING = null;
        State.shapes.HEADER = null;
    }
}
