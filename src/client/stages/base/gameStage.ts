import { CANVAS } from "../../../shared/const";
import { RoomOptionsMessage } from "../../../shared/room/roomOptions";
import { Shape } from "../../../shared/shape";
import { noop } from "../../../shared/util";
import { COPY_CONNECTING } from "../../copy/copy";
import { ClientRoom } from "../../room/clientRoom";
import { ClientSocketPlayer } from "../../room/clientSocketPlayer";
import { State } from "../../state";
import { font } from "../../ui/font";
import { center, flash } from "../../ui/shapeClient";
import { StageInterface } from "./stage";

export class GameStage implements StageInterface {
    constructor() {}

    getShape(): Shape {
        return new Shape();
    }

    construct(): void {
        State.shapes.CONNECTING = this.connectingShape;
        this.connectServer().then(() => {
            new ClientRoom(
                State.flow.data.clientPlayer,
                (room: ClientRoom) => {
                    this.destructStageLeftovers();
                    room.setupComponents();
                },
                noop,
            );
            State.flow.data.clientPlayer.send(new RoomOptionsMessage(State.flow.data.roomOptions));
        });
    }

    destruct(): void {
        if (State.flow.data.clientPlayer) {
            State.flow.data.clientPlayer.destruct();
        }
        delete State.shapes.CONNECTING;
    }

    async connectServer(): Promise<void> {
        return new Promise((resolve) => {
            if (State.flow.data.clientPlayer) {
                resolve();
            } else {
                State.flow.data.clientPlayer = new ClientSocketPlayer(
                    State.flow.data.name,
                    resolve,
                );
            }
        });

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
