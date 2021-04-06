import { EventEmitter } from "events";
import { Server as WebsocketServer } from "ws";
import { SERVER_HOST, SERVER_PATH, SERVER_PORT } from "../../shared/config";
import { ServerRoomManager } from "../room/roomManager";
import { ServerPlayer } from "../room/serverPlayer";

export class Server {
    private emitter: EventEmitter;
    private roomManager?: ServerRoomManager;
    private ws: WebsocketServer;

    constructor() {
        this.emitter = new EventEmitter();
        this.roomManager = new ServerRoomManager(this);
        this.ws = new WebsocketServer({
            host: SERVER_HOST,
            port: SERVER_PORT,
            path: SERVER_PATH,
        });
        this.ws.on("connection", () => {
            new ServerPlayer(this, this.ws);
        });
    }

    destruct(): void {
        this.roomManager.destruct();
        this.ws.close();
    }
}
