import { HEIGHT, NC_PLAYER_NAME, NC_ROOM_JOIN_MATCHING, WIDTH } from "../../shared/const";
import { Shape } from "../../shared/shape";
import { getRandomName } from "../../shared/util";
import { NS, STORAGE_NAME } from "../const";
import { COPY_CONNECTING } from "../copy/copy";
import { ClientRoom } from "../room/clientRoom";
import { ClientSocketPlayer } from "../room/clientSocketPlayer";
import { ClientOptions } from "../room/options";
import { ClientState } from "../state/clientState";
import { font } from "../ui/font";
import { center, flash, lifetime } from "../ui/shapeClient";
import { storage } from "../util/clientUtil";
import { StageInterface } from "./stage";

export class GameStage implements StageInterface {
    getShape(): Shape {
        return new Shape();
    }

    getData(): Record<string, unknown> {
        return {};
    }

    construct(): void {
        this.connectServer();
    }

    destruct(): void {
        if (ClientState.player) {
            if (ClientState.player.room) {
                ClientState.player.room.destruct();
            }
            ClientState.player.destruct();
        }
        ClientState.events.off("keydown", NS.STAGES);
        ClientState.shapes.CONNECTING = null;
    }

    getSerializedGameOptions(): [number, number, number, number, number, number] {
        const data = ClientState.flow.getData();
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

    getEmitData(): [number, number, number, number, number, number] {
        return this.getSerializedGameOptions();
    }

    connectServer(): void {
        ClientState.shapes.CONNECTING = this.getConnectingShape();
        ClientState.player = new ClientSocketPlayer(this.connectRoom.bind(this));
    }

    connectRoom(): void {
        ClientState.player.room = new ClientRoom();
        ClientState.player.room.setupComponents();
        ClientState.player.emit(NC_PLAYER_NAME, [this.getPlayerName()]);
        ClientState.player.emit(NC_ROOM_JOIN_MATCHING, this.getEmitData());
        this.destructStageLeftovers();
    }

    getConnectingShape(): Shape {
        const shape = font(COPY_CONNECTING);
        center(shape, WIDTH, HEIGHT - 20);
        lifetime(shape, 2000);
        flash(shape);
        return shape;
    }

    destructStageLeftovers(): void {
        if (ClientState.menuSnake) {
            ClientState.menuSnake.destruct();
        }
        ClientState.shapes.CONNECTING = null;
        ClientState.shapes.HEADER = null;
    }
}
