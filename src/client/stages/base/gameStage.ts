import { CANVAS } from "../../../shared/const";
import { NameMessage } from "../../../shared/room/player";
import { Shape } from "../../../shared/shape";
import { NS } from "../../const";
import { COPY_CONNECTING } from "../../copy/copy";
import { ClientSocketPlayer } from "../../room/clientSocketPlayer";
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
        this.connectServer();
    }

    destruct(): void {
        State.events.off("keydown", NS.STAGES);
        delete State.shapes.CONNECTING;
    }

    connectServer(): void {
        if (!State.flow.data.clientPlayer) {
            console.log("Create player with connection");

            State.flow.data.clientPlayer = new ClientSocketPlayer(State.flow.data.name, () => {
                console.log("Looks like I'm connected");
                State.flow.data.clientPlayer.emit(NameMessage.from(State.flow.data.name));
            });
        }

        // const clientPlayer = new ClientSocketPlayer(() => {
        //     clientPlayer.room = new ClientRoom(clientPlayer);
        //     clientPlayer.room.setupComponents();
        //     clientPlayer.emitDeprecated(NC_PLAYER_NAME, [State.flow.data.name]);
        //     clientPlayer.emitDeprecated(NC_ROOM_JOIN_MATCHING, State.flow.data.roomOptions.serialize());
        //     this.destructStageLeftovers();
        // });
    }

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
