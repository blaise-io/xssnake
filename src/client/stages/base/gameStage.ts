import { CANVAS } from "../../../shared/const";
import { RoomOptionsMessage } from "../../../shared/room/roomMessages";
import { Shape } from "../../../shared/shape";
import { COPY_CONNECTING } from "../../copy/copy";
import { ClientRoom } from "../../room/clientRoom";
import { ClientSocketPlayer } from "../../room/clientSocketPlayer";
import { State } from "../../state";
import { font } from "../../ui/font";
import { center, flash } from "../../ui/shapeClient";
import { StageInterface } from "./stage";

export class GameStage implements StageInterface {
    private room?: ClientRoom;

    constructor() {}

    getShape(): Shape {
        return new Shape();
    }

    construct(): void {
        State.shapes.CONNECTING = this.connectingShape;
        this.connectServer().then((clientSocketPlayer) => {
            this.room = new ClientRoom(clientSocketPlayer, (room) => {
                this.destructStageLeftovers();
                room.setupComponents();
            });
            clientSocketPlayer.send(new RoomOptionsMessage(State.flow.data.roomOptions));
        });
    }

    destruct(): void {
        if (State.flow.data.clientPlayer) {
            State.flow.data.clientPlayer.destruct();
            delete State.flow.data.clientPlayer;
        }
        if (this.room) {
            this.room.destruct();
        }
        delete State.shapes.CONNECTING;
    }

    async connectServer(): Promise<ClientSocketPlayer> {
        return new Promise((resolve) => {
            if (State.flow.data.clientPlayer) {
                resolve(State.flow.data.clientPlayer);
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
        delete State.shapes.HEADER;
        delete State.shapes.CONNECTING;
        if (State.menuSnake) {
            State.menuSnake.destruct();
        }
    }
}
