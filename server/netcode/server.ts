import * as events from "events";
import * as ws from "ws";
import { SERVER_HOST, SERVER_PATH, SERVER_PORT } from "../../shared/config";
import { ServerRoomManager } from "../room/roomManager";
import { ServerPlayer } from "../room/serverPlayer";

const WebSocket = require("ws");
const EventEmitter = require("events").EventEmitter;

export class Server {
    private emitter: events.EventEmitter;
    private roomManager?: ServerRoomManager;
    private ws: ws.Server;

    constructor() {
        this.emitter = new EventEmitter();
        this.roomManager = new ServerRoomManager(this);
        this.ws = new WebSocket.Server({
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
