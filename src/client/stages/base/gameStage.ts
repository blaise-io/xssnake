import { CANVAS } from "../../../shared/const";
import { Shape } from "../../../shared/shape";
import { _ } from "../../../shared/util";
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
            this.room = new ClientRoom(clientSocketPlayer, () => {
                delete State.shapes.HEADER;
                delete State.shapes.CONNECTING;
                State.menuSnake?.destruct();
            });
        });
    }

    destruct(): void {
        State.flow.data.clientPlayer?.destruct();
        delete State.flow.data.clientPlayer;
        this.room?.destruct();
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
    }

    get connectingShape(): Shape {
        const shape = font(_("Connecting..."));
        center(shape, CANVAS.WIDTH, CANVAS.HEIGHT - 20);
        flash(shape);
        return shape;
    }
}
