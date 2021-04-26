import { HEIGHT, WIDTH } from "../../../shared/const";
import { Shape } from "../../../shared/shape";
import { getRandomName } from "../../../shared/util";
import { NS, STORAGE_NAME } from "../../const";
import { COPY_CONNECTING } from "../../copy/copy";
import { FlowData } from "../../flow";
import { State } from "../../state";
import { font } from "../../ui/font";
import { center, flash, lifetime } from "../../ui/shapeClient";
import { storage } from "../../util/clientUtil";
import { StageInterface } from "./stage";

export class GameStage implements StageInterface {
    constructor(public flowData: FlowData) {}

    getShape(): Shape {
        return new Shape();
    }

    construct(): void {
        State.shapes.CONNECTING = this.connectingShape;
        // this.connectServer();
    }

    destruct(): void {
        State.events.off("keydown", NS.STAGES);
        State.shapes.CONNECTING = null;
    }

    getPlayerName(): string {
        let name = storage(STORAGE_NAME) as string;
        if (!name) {
            name = getRandomName();
            storage(name, STORAGE_NAME);
        }
        return name;
    }

    // connectServer(): void {
    //     const clientPlayer = new ClientSocketPlayer(() => {
    //         clientPlayer.room = new ClientRoom(clientPlayer);
    //         clientPlayer.room.setupComponents();
    //         clientPlayer.emit(NC_PLAYER_NAME, [this.getPlayerName()]);
    //         clientPlayer.emit(NC_ROOM_JOIN_MATCHING, this.flowData.roomOptions.serialize());
    //         this.destructStageLeftovers();
    //     });
    // }

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
