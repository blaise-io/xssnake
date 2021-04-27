import { CANVAS } from "../../../shared/const";
import { Shape } from "../../../shared/shape";
import { NS } from "../../const";
import { COPY_CONNECTING } from "../../copy/copy";
import { State } from "../../state";
import { font } from "../../ui/font";
import { center, flash, lifetime } from "../../ui/shapeClient";
import { StageInterface } from "./stage";

export class GameStage implements StageInterface {
    constructor() {}

    getShape(): Shape {
        return new Shape();
    }

    construct(): void {
        State.shapes.CONNECTING = this.connectingShape;
        // this.connectServer();
    }

    destruct(): void {
        State.events.off("keydown", NS.STAGES);
        delete State.shapes.CONNECTING;
    }

    // connectServer(): void {
    //     const clientPlayer = new ClientSocketPlayer(() => {
    //         clientPlayer.room = new ClientRoom(clientPlayer);
    //         clientPlayer.room.setupComponents();
    //         clientPlayer.emit(NC_PLAYER_NAME, [this.getPlayerName()]);
    //         clientPlayer.emit(NC_ROOM_JOIN_MATCHING, State.flow.data.roomOptions.serialize());
    //         this.destructStageLeftovers();
    //     });
    // }

    get connectingShape(): Shape {
        const shape = font(COPY_CONNECTING);
        center(shape, CANVAS.WIDTH, CANVAS.HEIGHT - 20);
        lifetime(shape, 2000);
        flash(shape);
        return shape;
    }

    destructStageLeftovers(): void {
        if (State.menuSnake) {
            State.menuSnake.destruct();
        }
        State.shapes.CONNECTING = undefined;
        State.shapes.HEADER = undefined;
    }
}
