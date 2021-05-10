import { EventEmitter } from "events";
import * as ws from "ws";
import { SERVER_HOST, SERVER_PATH, SERVER_PORT } from "../../shared/config";
import { HEARTBEAT_INTERVAL_MS } from "../../shared/const";
import { ServerRoomManager } from "../room/roomManager";
import { ServerPlayer } from "../room/serverPlayer";

export interface SocketClient extends ws {
    pingSent: number;
    pongReceived: number;
    latency: number;
}

export class Server {
    emitter: EventEmitter;
    roomManager: ServerRoomManager;
    private ws: ws.Server;
    private pingInterval: NodeJS.Timeout;

    constructor() {
        this.emitter = new EventEmitter();
        this.roomManager = new ServerRoomManager(this);
        this.ws = new ws.Server({
            host: SERVER_HOST,
            port: SERVER_PORT,
            path: SERVER_PATH,
            maxPayload: 256,
            clientTracking: true,
        });

        this.ws.on("connection", (client: SocketClient) => {
            client.pingSent = client.pongReceived = new Date().getTime();
            client.latency = 0;
            client.on("pong", () => {
                client.pongReceived = new Date().getTime();
                client.latency = new Date().getTime() - client.pingSent;
            });
            new ServerPlayer(this, client);
        });

        this.pingInterval = setInterval(() => {
            ((this.ws.clients as unknown) as SocketClient[]).forEach((client: SocketClient) => {
                if (client.pongReceived - client.pingSent > HEARTBEAT_INTERVAL_MS * 2) {
                    return client.terminate();
                }
                client.pingSent = new Date().getTime();
                client.ping();
            });
        }, HEARTBEAT_INTERVAL_MS);

        console.log(`Running WebSocket server at ${SERVER_HOST}:${SERVER_PATH}${SERVER_PORT}`);
    }

    destruct(): void {
        this.roomManager.destruct();
        this.ws.close();
        clearInterval(this.pingInterval);
    }
}
