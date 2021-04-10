import { EventEmitter } from "events";
import * as ws from "ws";
import { SERVER_HOST, SERVER_PATH, SERVER_PORT } from "../../shared/config";
import { ServerRoomManager } from "../room/roomManager";
import { ServerPlayer } from "../room/serverPlayer";

export class Server {
    emitter: EventEmitter;
    roomManager?: ServerRoomManager;
    private ws: ws.Server;

    constructor() {
        this.emitter = new EventEmitter();
        this.roomManager = new ServerRoomManager(this);
        this.ws = new ws.Server({
            host: SERVER_HOST,
            port: SERVER_PORT,
            path: SERVER_PATH,
        });
        this.ws.on("connection", (socket: ws) => {
            new ServerPlayer(this, socket);
        });
    }

    destruct(): void {
        this.roomManager.destruct();
        this.ws.close();
    }
}
