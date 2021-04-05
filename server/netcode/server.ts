import { SERVER_HOST, SERVER_PATH, SERVER_PORT } from "../../shared/config";
import { ServerRoomManager } from "../room/roomManager";
import { Server as WebSocketServer } from "ws";
import { EventEmitter } from "events";
import { ServerPlayer } from "../room/serverPlayer";

export class Server {
    private emitter;
    private roomManager: ServerRoomManager;
    private ws: WebSocketServer;

    constructor() {
        this.emitter = new EventEmitter();
        this.roomManager = new ServerRoomManager(this);
        this.ws = this.start();
    }

    destruct(): void {
        this.roomManager.destruct();
        this.roomManager = null;
        this.ws.close();
    }

    start(): WebSocketServer {
        const ws = new WebSocketServer({
            host: SERVER_HOST,
            port: SERVER_PORT,
            path: SERVER_PATH,
        });

        ws.on("connection", (connection) => {
            new ServerPlayer(this, connection);
        });

        return ws;
    }
}
