import { CANVAS } from "../../../shared/const";
import { PlayersMessage } from "../../../shared/room/playerRegistry";
import {
    RoomJoinErrorMessage,
    RoomKeyMessage,
    RoomOptionsClientMessage,
    RoomOptionsServerMessage,
} from "../../../shared/room/roomMessages";
import { RoundLevelMessage } from "../../../shared/room/roundMessages";
import { Shape } from "../../../shared/shape";
import { _ } from "../../../shared/util";
import { EventHandler } from "../../util/eventHandler";
import { ClientPlayerRegistry } from "../../room/clientPlayerRegistry";
import { ClientRoom, COPY_ERROR } from "../../room/clientRoom";
import { ClientSocketPlayer } from "../../room/clientSocketPlayer";
import { State } from "../../state";
import { font } from "../../ui/font";
import { center, flash } from "../../ui/shapeClient";
import { error } from "../../util/clientUtil";
import { StageInterface } from "./stage";

export class GameStage implements StageInterface {
    private room?: ClientRoom;
    private eventHandler = new EventHandler();

    getShape(): Shape {
        return new Shape();
    }

    construct(): void {
        State.shapes.CONNECTING = this.connectingShape;
        this.connectServer().then((clientSocketPlayer) => {
            this.joinRoom(clientSocketPlayer);
        });
    }

    destruct(): void {
        State.flow.data.clientPlayer?.destruct();

        delete State.shapes.CONNECTING;
        delete State.flow.data.clientPlayer;

        this.room?.destruct();
        this.eventHandler.destruct();
    }

    async connectServer(): Promise<ClientSocketPlayer> {
        return new Promise((resolve) => {
            if (State.flow.data.clientPlayer) {
                // AutoJoinStage may have connected a player.
                resolve(State.flow.data.clientPlayer);
            } else {
                const name = State.flow.data.name;
                State.flow.data.clientPlayer = new ClientSocketPlayer(name, resolve);
            }
        });
    }

    joinRoom(clientSocketPlayer: ClientSocketPlayer): void {
        clientSocketPlayer.send(new RoomOptionsServerMessage(State.flow.data.roomOptions));

        Promise.all<RoomKeyMessage, PlayersMessage, RoomOptionsClientMessage, RoundLevelMessage>([
            new Promise((resolve) => {
                this.eventHandler.on(RoomKeyMessage.id, resolve);
            }),
            new Promise((resolve) => {
                this.eventHandler.on(PlayersMessage.id, resolve);
            }),
            new Promise((resolve) => {
                this.eventHandler.on(RoomOptionsClientMessage.id, resolve);
            }),
            new Promise((resolve) => {
                this.eventHandler.on(RoundLevelMessage.id, resolve);
            }),
        ]).then((messages) => {
            this.createClientRoom(clientSocketPlayer, ...messages);
        });

        this.eventHandler.on(RoomJoinErrorMessage.id, (message: RoomJoinErrorMessage) => {
            error(COPY_ERROR[message.status]);
        });
    }

    private createClientRoom(
        clientSocketPlayer: ClientSocketPlayer,
        roomKeyMessage: RoomKeyMessage,
        playersMessage: PlayersMessage,
        roomOptionsMessage: RoomOptionsClientMessage,
        roundLevelMessage: RoundLevelMessage,
    ) {
        delete State.shapes.HEADER;
        delete State.shapes.CONNECTING;
        State.menuSnake?.destruct();

        const players = ClientPlayerRegistry.fromPlayerRegistry(
            playersMessage.players,
            clientSocketPlayer,
        );

        this.room = new ClientRoom(
            roomKeyMessage.key,
            players,
            roomOptionsMessage.options,
            roundLevelMessage.levelIndex,
        );
    }

    get connectingShape(): Shape {
        const shape = font(_("Connecting..."));
        center(shape, CANVAS.WIDTH, CANVAS.HEIGHT - 20);
        flash(shape);
        return shape;
    }
}
